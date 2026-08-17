<?php

namespace Database\Seeders\Prep3;

use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Services\LessonEditorService;
use App\Domains\Lesson\Services\LessonService;
use App\Domains\Lesson\Services\ParagraphService;
use Database\Seeders\Data\LessonSpec;
use Database\Seeders\Prep3\Data\Arabic;
use Database\Seeders\Prep3\Data\Math;
use Database\Seeders\Prep3\Data\Science;
use Database\Seeders\Prep3\Data\SocialStudies;
use Illuminate\Database\Seeder;

/**
 * سيدر مستقل للصف الثالث الإعدادي — الفصل الدراسي الأول.
 *
 * يبني المقررات (الوحدات) والدروس برحلاتها الكاملة للمواد الأربع
 * المتوفرة في المساعد الذكي (اللغة العربية، الرياضيات، العلوم، الدراسات الاجتماعية)
 * مستقلًّا عن CurriculumData/ContentCatalog: يحل الصف والمادة مباشرة من قاعدة البيانات،
 * ويزيل المقررات العامة (الوحدة الأولى/الثانية) التي أنشأها CourseSeeder لهذه المواد.
 */
class Prep3Seeder extends Seeder
{
    private const GRADE_NAME = 'الصف الثالث الإعدادي';

    private const SUBJECTS = ['اللغة العربية', 'الرياضيات', 'العلوم', 'الدراسات الاجتماعية'];

    public function run(): void
    {
        $grade = Grade::query()
            ->whereHas('stage', fn ($q) => $q->where('key', 'prep'))
            ->where('name', self::GRADE_NAME)
            ->firstOrFail();

        $semester = $grade->semesters()->orderBy('sort_order')->firstOrFail(); // الفصل الأول

        // 1) إزالة المقررات العامة للمواد الأربع حتى تحل محلها وحدات حقيقية.
        foreach (self::SUBJECTS as $subjectName) {
            $subject = $this->subjectOf($grade, $semester->id, $subjectName);

            foreach ($subject->courses as $course) {
                if (in_array($course->name, ['الوحدة الأولى', 'الوحدة الثانية'], true)) {
                    $course->delete();
                }
            }
        }

        // 2) إنشاء المقررات والدروس الكاملة لكل خطة من خطط المواد الأربع.
        $plans = [
            ...Arabic::plans(),
            ...Math::plans(),
            ...Science::plans(),
            ...SocialStudies::plans(),
        ];

        foreach ($plans as $plan) {
            $subject = $this->subjectOf($grade, $semester->id, $plan['subject']);
            $course = $this->createCourse($subject, $plan);

            foreach ($plan['lessons'] as $index => $spec) {
                $lesson = $this->createLesson($course, $spec, $index);
                $this->buildJourney($lesson, $spec);
            }
        }
    }

    private function subjectOf(Grade $grade, int $semesterId, string $name): Subject
    {
        return Subject::query()
            ->where('grade_id', $grade->id)
            ->where('semester_id', $semesterId)
            ->where('name', $name)
            ->firstOrFail();
    }

    private function createCourse(Subject $subject, array $plan)
    {
        return app(CurriculumService::class)->createCourse([
            'subject_id' => $subject->id,
            'name' => $plan['unit'],
            'description' => $plan['description'],
            'icon' => $subject->icon,
            'color' => $subject->color,
            'sort_order' => app(CurriculumService::class)->nextCourseOrder($subject->id),
            'is_published' => true,
        ]);
    }

    private function createLesson($course, array $spec, int $index): Lesson
    {
        return app(LessonService::class)->createLesson([
            'course_id' => $course->id,
            'title' => $spec['title'],
            'summary' => $spec['summary'] ?? null,
            'learning_objectives' => $spec['objectives'] ?? [],
            'video' => $spec['video'] ?? null,
            'icon' => $course->icon,
            'color' => $course->color,
            'sort_order' => $index,
            'is_published' => true,
        ]);
    }

    /** بناء رحلة الدرس بالترتيب الرسمي: قبلي ← (فقرة + تكويني)* ← فيديو شامل ← نهائي. */
    private function buildJourney(Lesson $lesson, array $spec): void
    {
        $editor = app(LessonEditorService::class);
        $paragraphService = app(ParagraphService::class);

        // يتخلص من الفقرة الفارغة الافتراضية في القالب (كتلتها تُحذف بالتتابع).
        $defaultParagraphBlock = $lesson->blocks()
            ->where('block_kind', BlockKind::Paragraph->value)
            ->first();
        if ($defaultParagraphBlock !== null) {
            $paragraphService->deleteParagraph($defaultParagraphBlock->paragraph_id);
        }

        $preBlock = $lesson->blocks()->where('block_kind', BlockKind::PreAssessment->value)->firstOrFail();
        $finalBlock = $lesson->blocks()->where('block_kind', BlockKind::FinalAssessment->value)->firstOrFail();

        $orderedBlockIds = [$preBlock->id];

        foreach ($spec['paragraphs'] as $paragraph) {
            $paragraphBlock = $editor->addParagraph($lesson->id, [
                'title' => $paragraph['title'],
                'content' => $paragraph['content'],
                'image' => $paragraph['image'] ?? $this->fallbackParagraphImage($lesson, $paragraph['title']),
                'icon' => $lesson->icon,
                'color' => $lesson->color,
            ]);
            $orderedBlockIds[] = $paragraphBlock->id;

            if (! empty($paragraph['formative'])) {
                $formativeBlock = $editor->addFormativeAssessment($lesson->id, [
                    'title' => 'تقييم: '.$paragraph['title'],
                    'paragraph_id' => $paragraphBlock->paragraph_id,
                ]);
                $orderedBlockIds[] = $formativeBlock->id;
            }
        }

        if (! empty($spec['video'])) {
            $videoBlock = $editor->addLessonVideo($lesson->id);
            $orderedBlockIds[] = $videoBlock->id;
        }

        $orderedBlockIds[] = $finalBlock->id;

        $editor->reorder($lesson->id, $orderedBlockIds);
    }

    private function fallbackParagraphImage(Lesson $lesson, string $title): string
    {
        return LessonSpec::diagram($title, $lesson->course->subject->name ?? 'اللغة العربية');
    }
}

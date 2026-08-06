<?php

namespace Database\Seeders\Lesson;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Services\LessonEditorService;
use App\Domains\Lesson\Services\LessonService;
use App\Domains\Lesson\Services\ParagraphService;
use Database\Seeders\Data\ContentCatalog;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * ينشئ الدروس ورحلاتها الكاملة عبر نقطة الإنشاء الموحدة:
 * LessonService::createLesson (القوالب) + LessonEditorService (فقرات/تقييمات/فيديو/ترتيب).
 * لا يُدخل أي محتوى إدراجًا مباشرًا؛ والأسئلة تُترك لـ AssessmentSeeder و QuestionSeeder.
 */
class LessonSeeder extends Seeder
{
    public function run(): void
    {
        $lessonService = app(LessonService::class);

        foreach (ContentCatalog::plans() as $plan) {
            $courseId = SeedRegistry::$courses[
                ContentCatalog::planKey($plan['grade'], $plan['semester'], $plan['subject']).'|'.$plan['unit']
            ] ?? null;

            if ($courseId === null) {
                continue;
            }

            $course = Course::findOrFail($courseId);

            foreach ($plan['lessons'] as $index => $spec) {
                $lesson = $lessonService->createLesson([
                    'course_id' => $course->id,
                    'title' => $spec['title'],
                    'summary' => $spec['summary'] ?? null,
                    'learning_objectives' => $spec['objectives']
                        ?? [self::defaultObjective($spec['title'])],
                    'video' => $spec['video'] ?? null,
                    'icon' => $course->icon,
                    'color' => $course->color,
                    'sort_order' => $index,
                    'is_published' => true,
                ]);

                $this->buildJourney($lesson, $spec);
            }
        }
    }

    /** الهدف الافتراضي لأي درس لا يحدد أهدافًا صريحة. */
    private static function defaultObjective(string $title): string
    {
        return 'أتقن مفاهيم درس «'.$title.'» وتطبّقها في أمثلة من الحياة اليومية.';
    }

    /**
     * بناء رحلة الدرس بالترتيب الرسمي: قبلي ← (فقرة + تكويني)* ← فيديو شامل ← نهائي.
     */
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
        $formativeAssessmentIds = [];

        foreach ($spec['paragraphs'] as $index => $paragraph) {
            $paragraphBlock = $editor->addParagraph($lesson->id, [
                'title' => $paragraph['title'],
                'content' => $paragraph['content'],
                'image' => $paragraph['image'] ?? null,
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
                $formativeAssessmentIds[$index] = $formativeBlock->assessment_id;
            }
        }

        if (! empty($spec['video'])) {
            $videoBlock = $editor->addLessonVideo($lesson->id);
            $orderedBlockIds[] = $videoBlock->id;
        }

        $orderedBlockIds[] = $finalBlock->id;

        // الترتيب الرسمي للرحلة.
        $editor->reorder($lesson->id, $orderedBlockIds);

        // تسليم بيانات الدرس للـ AssessmentSeeder.
        SeedRegistry::$lessons[$lesson->id] = [
            'pre' => $preBlock->assessment_id,
            'formatives' => $formativeAssessmentIds,
            'final' => $finalBlock->assessment_id,
            'spec' => $spec,
        ];
    }
}

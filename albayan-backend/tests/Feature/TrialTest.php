<?php

namespace Tests\Feature;

use App\Domains\Assessment\Services\AssessmentService;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Services\LessonBlockService;
use App\Domains\Lesson\Services\LessonEditorService;
use App\Domains\Lesson\Services\LessonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrialTest extends TestCase
{
    use RefreshDatabase;

    private function seedTree(): array
    {
        $stage = Stage::create(['key' => 'primary', 'name' => 'المرحلة الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $grade = Grade::create(['stage_id' => $stage->id, 'key' => 'grade-1', 'name' => 'الصف الأول', 'sort_order' => 1, 'is_published' => true]);
        $semester = Semester::create(['grade_id' => $grade->id, 'key' => 'semester-1', 'name' => 'الفصل الأول', 'sort_order' => 0]);
        $subject = Subject::create(['grade_id' => $grade->id, 'semester_id' => $semester->id, 'name' => 'الرياضيات', 'slug' => 'math', 'sort_order' => 1, 'is_published' => true]);
        $course = Course::create(['subject_id' => $subject->id, 'name' => 'الوحدة الأولى', 'description' => 'مفاهيم أساسية', 'sort_order' => 1, 'is_published' => true]);

        return compact('stage', 'grade', 'semester', 'subject', 'course');
    }

    /**
     * ينشئ درسًا برحلة افتراضية [قبلي، فقرة، ختامي] + فيديو، ثم يضيف
     * فقرة ثانية مع تقييم تكويني بعد كل فقرة (ثلاثة أسئلة لكل تكويني).
     */
    private function makeLesson(array $tree, array $overrides = []): Lesson
    {
        $lesson = app(LessonService::class)->createLesson(array_merge([
            'course_id' => $tree['course']->id,
            'title' => 'درس الجمع',
            'video' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'sort_order' => 1,
            'is_published' => true,
        ], $overrides));

        $editor = app(LessonEditorService::class);

        // فيديو شامل — لا يُكشف داخل نافذة التجربة.
        app(LessonBlockService::class)->createBlock($lesson->id, BlockKind::LessonVideo);

        // الفقرة الأولى + تكوينيها، ثم فقرة ثانية + تكوينيها.
        $firstParagraph = $lesson->paragraphs()->orderBy('sort_order')->first();
        $editor->addFormativeAssessment($lesson->id, ['paragraph_id' => $firstParagraph->id, 'title' => 'تحقق سريع ١']);

        $secondBlock = $editor->addParagraph($lesson->id, ['title' => 'فقرة ثانية', 'content' => '{"type":"doc","content":[]}']);
        $editor->addFormativeAssessment($lesson->id, ['paragraph_id' => $secondBlock->paragraph_id, 'title' => 'تحقق سريع ٢']);

        // ثلاثة أسئلة لكل تكويني — تُقتصر على سؤالين في النافذة.
        foreach ($lesson->assessments()->where('type', 'formative')->orderBy('id')->get() as $formative) {
            foreach ([0, 1, 2] as $order) {
                $question = app(AssessmentService::class)->createQuestion([
                    'assessment_id' => $formative->id,
                    'type' => 'mcq',
                    'content' => "أسئلة التجربة {$order}",
                    'sort_order' => $order,
                ]);
                app(AssessmentService::class)->createOption([
                    'question_id' => $question->id,
                    'content' => 'خيار صحيح',
                    'is_correct' => true,
                    'sort_order' => 0,
                ]);
                app(AssessmentService::class)->createOption([
                    'question_id' => $question->id,
                    'content' => 'خيار خاطئ',
                    'is_correct' => false,
                    'sort_order' => 1,
                ]);
            }
        }

        return $lesson;
    }

    public function test_trial_is_public_and_returns_limited_window(): void
    {
        $this->makeLesson($this->seedTree());

        $response = $this->getJson('/api/trial');
        $response->assertStatus(200);

        $blocks = $response->json('data.blocks');

        // النافذة: [فقرة ← تكويني] × 2 فقط — لا قبلي ولا ختامي ولا فيديو.
        $this->assertCount(4, $blocks);
        $this->assertSame(
            ['paragraph', 'formative_assessment', 'paragraph', 'formative_assessment'],
            array_column($blocks, 'kind')
        );

        // كل تكويني يتبع الفقرة التي ينتمي إليها (paragraph_id).
        foreach ([0, 2] as $paragraphIndex) {
            $this->assertSame(
                $blocks[$paragraphIndex]['data']['id'],
                $blocks[$paragraphIndex + 1]['data']['paragraph_id']
            );
        }

        // سؤالان فقط لكل تكويني رغم إنشاء ثلاثة.
        foreach ([1, 3] as $assessmentIndex) {
            $this->assertCount(2, $blocks[$assessmentIndex]['data']['questions']);
        }

        // الإجابات الصحيحة مكشوفة للتغذية الفورية داخل التجربة.
        $question = $blocks[1]['data']['questions'][0];
        $correct = collect($question['options'])->first(fn ($o) => $o['is_correct'] === true);
        $this->assertNotNull($correct);
    }

    public function test_trial_includes_only_first_two_paragraphs(): void
    {
        $tree = $this->seedTree();
        $lesson = $this->makeLesson($tree);

        // فقرة ثالثة دون تقييم تكويني — خارج نافذة التجربة.
        $editor = app(LessonEditorService::class);
        $editor->addParagraph($lesson->id, ['title' => 'فقرة ثالثة', 'content' => '{"type":"doc","content":[]}']);

        $response = $this->getJson('/api/trial');
        $response->assertStatus(200);

        $blocks = $response->json('data.blocks');

        $this->assertCount(2, collect($blocks)->where('kind', 'paragraph'));

        $titles = collect($blocks)->where('kind', 'paragraph')->pluck('data.title')->all();
        $this->assertNotContains('فقرة ثالثة', $titles);
    }

    public function test_trial_prefers_configured_lesson(): void
    {
        $tree = $this->seedTree();
        $first = $this->makeLesson($tree);
        $second = $this->makeLesson($tree, ['title' => 'درس ثانٍ', 'sort_order' => 2]);

        config(['madrasati.trial_lesson_slug' => $second->slug]);

        $response = $this->getJson('/api/trial');
        $response->assertStatus(200);
        $this->assertSame('درس ثانٍ', $response->json('data.lesson.title'));
    }

    public function test_trial_prefers_arabic_lesson_by_default(): void
    {
        // مادة الرياضيات أولًا، ثم درس في اللغة العربية — يُفضَّل العربي افتراضيًا.
        $tree = $this->seedTree();
        $this->makeLesson($tree);

        $arabicSubject = Subject::create([
            'grade_id' => $tree['grade']->id,
            'semester_id' => $tree['semester']->id,
            'name' => 'اللغة العربية',
            'slug' => 'arabic',
            'sort_order' => 2,
            'is_published' => true,
        ]);
        $arabicCourse = Course::create([
            'subject_id' => $arabicSubject->id,
            'name' => 'الوحدة الأولى',
            'description' => 'مفاهيم أساسية',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $this->makeLesson([
            'stage' => $tree['stage'],
            'grade' => $tree['grade'],
            'semester' => $tree['semester'],
            'subject' => $arabicSubject,
            'course' => $arabicCourse,
        ], ['title' => 'درس عربي']);

        $response = $this->getJson('/api/trial');
        $response->assertStatus(200);
        $this->assertSame('درس عربي', $response->json('data.lesson.title'));
    }
}

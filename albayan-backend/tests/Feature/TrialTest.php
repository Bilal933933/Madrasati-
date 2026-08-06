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
use App\Domains\Lesson\Models\Paragraph;
use App\Domains\Lesson\Services\LessonBlockService;
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
     * ينشئ درسًا برحلة كاملة: [قبلي، فقرة، ختامي] + فيديو، وأسئلة على القبلي.
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

        app(LessonBlockService::class)->createBlock($lesson->id, BlockKind::LessonVideo);

        $pre = $lesson->assessments()->where('type', 'pre')->first();
        foreach ([0, 1, 2] as $order) {
            $question = app(AssessmentService::class)->createQuestion([
                'assessment_id' => $pre->id,
                'type' => 'mcq',
                'content' => "أسئلة التجربة $order",
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

        return $lesson;
    }

    public function test_trial_is_public_and_returns_limited_window(): void
    {
        $this->makeLesson($this->seedTree());

        $response = $this->getJson('/api/trial');
        $response->assertStatus(200);

        $blocks = $response->json('data.blocks');
        $this->assertCount(3, $blocks);
        $this->assertSame(['paragraph', 'lesson_video', 'pre_assessment'], array_column($blocks, 'kind'));

        // لا يُكشف التقييم الختامي (نافذة مصغّرة لا الدرس الحقيقي).
        $kinds = array_column($blocks, 'kind');
        $this->assertNotContains('final_assessment', $kinds);

        // سؤالان فقط رغم إنشاء ثلاثة.
        $assessment = collect($blocks)->first(fn ($b) => $b['kind'] === 'pre_assessment');
        $this->assertCount(2, $assessment['data']['questions']);

        // الإجابات الصحيحة مكشوفة للتغذية الفورية داخل التجربة.
        $question = $assessment['data']['questions'][0];
        $correct = collect($question['options'])->first(fn ($o) => $o['is_correct'] === true);
        $this->assertNotNull($correct);
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

    public function test_trial_includes_only_first_paragraph(): void
    {
        $tree = $this->seedTree();
        $lesson = $this->makeLesson($tree);

        $secondParagraph = Paragraph::create([
            'lesson_id' => $lesson->id,
            'title' => 'فقرة ثانية',
            'content' => '{"type":"doc","content":[]}',
            'sort_order' => 2,
        ]);
        app(LessonBlockService::class)->createBlock($lesson->id, BlockKind::Paragraph, paragraphId: $secondParagraph->id);

        $response = $this->getJson('/api/trial');
        $response->assertStatus(200);

        $paragraphKinds = collect($response->json('data.blocks'))
            ->filter(fn ($b) => $b['kind'] === 'paragraph')
            ->count();
        $this->assertSame(1, $paragraphKinds);
    }
}

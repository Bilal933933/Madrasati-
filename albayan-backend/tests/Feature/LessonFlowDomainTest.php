<?php

namespace Tests\Feature;

use App\Domains\Assessment\Services\AssessmentService;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\LessonBlock;
use App\Domains\Lesson\Services\LessonEditorService;
use App\Domains\Lesson\Services\LessonFlowService;
use App\Domains\Lesson\Services\LessonService;
use App\Domains\Lesson\Services\LessonTemplateBuilder;
use App\Domains\Lesson\Services\ParagraphService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonFlowDomainTest extends TestCase
{
    use RefreshDatabase;

    private function seedLesson(array $attributes = []): Lesson
    {
        $stage = Stage::create(['name' => 'الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $grade = Grade::create(['stage_id' => $stage->id, 'name' => 'الأول', 'sort_order' => 1, 'is_published' => true]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'الرياضيات', 'sort_order' => 1, 'is_published' => true]);
        $course = Course::create(['subject_id' => $subject->id, 'name' => 'الوحدة الأولى', 'sort_order' => 1, 'is_published' => true]);

        return app(LessonService::class)->createLesson(array_merge([
            'course_id' => $course->id,
            'title' => 'درس الجمع',
            'sort_order' => 1,
            'is_published' => true,
        ], $attributes));
    }

    public function test_new_lesson_gets_default_template(): void
    {
        $lesson = $this->seedLesson();

        $this->assertSame(3, $lesson->blocks()->count());

        $kinds = $lesson->blocks()->orderBy('sort_order')->pluck('block_kind')->all();
        $this->assertSame([
            BlockKind::PreAssessment->value,
            BlockKind::Paragraph->value,
            BlockKind::FinalAssessment->value,
        ], $kinds);

        $pre = $lesson->blocks()->where('block_kind', BlockKind::PreAssessment->value)->first();
        $final = $lesson->blocks()->where('block_kind', BlockKind::FinalAssessment->value)->first();

        $this->assertSame('pre', $pre->assessment->type);
        $this->assertSame('final', $final->assessment->type);
    }

    public function test_flow_returns_ordered_journey(): void
    {
        $lesson = $this->seedLesson();

        $flow = app(LessonFlowService::class)->flow($lesson);

        $this->assertCount(3, $flow->blocks);
        $this->assertSame('paragraph', $flow->blocks[1]->block_kind);
        $this->assertNotNull($flow->blocks[1]->paragraph);
    }

    public function test_add_paragraph_block_appends_to_end(): void
    {
        $lesson = $this->seedLesson();

        app(LessonEditorService::class)->addParagraph(
            $lesson->id,
            ['title' => 'فقرة جديدة', 'content' => '<p>محتوى</p>'],
        );

        $this->assertSame(4, $lesson->blocks()->count());

        $last = LessonBlock::query()
            ->where('lesson_id', $lesson->id)
            ->orderByDesc('sort_order')
            ->first();
        $this->assertSame('فقرة جديدة', $last->paragraph->title);
    }

    public function test_reorder_changes_sequence(): void
    {
        $lesson = $this->seedLesson();

        $ids = $lesson->blocks()->orderBy('sort_order')->pluck('id')->all();
        $reversed = array_reverse($ids);

        app(LessonEditorService::class)->reorder($lesson->id, $reversed);

        $this->assertSame($reversed, $lesson->blocks()->orderBy('sort_order')->pluck('id')->all());
    }

    public function test_student_lesson_show_returns_flow_without_answers(): void
    {
        $lesson = $this->seedLesson();

        $student = User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);

        $response = $this->actingAs($student)->getJson("/api/lessons/{$lesson->slug}");
        $response->assertStatus(200);

        $json = $response->json('data');
        $this->assertArrayHasKey('lesson', $json);
        $this->assertArrayHasKey('blocks', $json);
        $this->assertCount(3, $json['blocks']);

        $preBlock = collect($json['blocks'])->firstWhere('kind', BlockKind::PreAssessment->value);
        $this->assertSame('pre', $preBlock['data']['type']);
        $this->assertArrayNotHasKey('is_correct', $preBlock['data'], 'الطالب يجب ألا يرى إجابات التقييم');
    }

    public function test_attach_existing_content_links_orphan_entities_once(): void
    {
        $lesson = $this->seedLesson();

        // محتوى «يتيم» أنشئ خارج المحرر (بلا كتلة) — محاكاة بيانات قديمة.
        $orphanParagraph = app(ParagraphService::class)->createParagraph([
            'lesson_id' => $lesson->id,
            'title' => 'فقرة يتيمة',
            'content' => '<p>محتوى</p>',
        ]);
        $orphanAssessment = app(AssessmentService::class)->createAssessment([
            'lesson_id' => $lesson->id,
            'type' => 'formative',
            'title' => 'تقييم يتيم',
        ]);

        $builder = app(LessonTemplateBuilder::class);
        $builder->attachExistingContent($lesson);

        // 3 (القالب) + 2 (اليتيمين)
        $this->assertSame(5, $lesson->blocks()->count());
        $this->assertTrue(
            $lesson->blocks()->where('paragraph_id', $orphanParagraph->id)->exists()
        );
        $this->assertTrue(
            $lesson->blocks()->where('assessment_id', $orphanAssessment->id)->exists()
        );

        // Idempotent: التشغيل مجددًا لا يكرر الكتل.
        $builder->attachExistingContent($lesson);
        $this->assertSame(5, $lesson->blocks()->count());
    }

    public function test_flow_exposes_next_lesson_and_course_slugs(): void
    {
        $stage = Stage::create(['name' => 'الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $grade = Grade::create(['stage_id' => $stage->id, 'name' => 'الأول', 'sort_order' => 1, 'is_published' => true]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'الرياضيات', 'slug' => 'math', 'sort_order' => 1, 'is_published' => true]);
        $course = Course::create(['subject_id' => $subject->id, 'name' => 'الوحدة الأولى', 'slug' => 'unit-one', 'sort_order' => 1, 'is_published' => true]);

        $first = app(LessonService::class)->createLesson([
            'course_id' => $course->id,
            'title' => 'درس الجمع',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        $second = app(LessonService::class)->createLesson([
            'course_id' => $course->id,
            'title' => 'درس الطرح',
            'sort_order' => 2,
            'is_published' => true,
        ]);

        $student = User::create(['name' => 'طالب', 'email' => 'student@flow.test', 'password' => 'secret', 'role' => 'student']);

        $response = $this->actingAs($student)->getJson("/api/lessons/{$first->slug}");
        $response->assertStatus(200);

        $json = $response->json('data');
        $this->assertSame('unit-one', $json['lesson']['course_slug']);
        $this->assertSame('math', $json['lesson']['subject_slug']);
        $this->assertSame($second->id, $json['next_lesson']['id']);
        $this->assertSame($second->slug, $json['next_lesson']['slug']);
        $this->assertSame('درس الطرح', $json['next_lesson']['title']);
        $this->assertNull($json['lesson_exam']);

        // آخر درس في المقرر — لا درس تالٍ.
        $last = $this->actingAs($student)->getJson("/api/lessons/{$second->slug}");
        $last->assertStatus(200);
        $this->assertNull($last->json('data.next_lesson'));
    }

    public function test_flow_exposes_active_lesson_exam(): void
    {
        $lesson = $this->seedLesson();

        $blueprint = ExamBlueprint::create([
            'exam_type' => 'lesson',
            'title' => 'امتحان درس الجمع',
            'lesson_id' => $lesson->id,
            'duration_minutes' => 30,
            'attempts_allowed' => 2,
            'easy_count' => 1,
            'medium_count' => 0,
            'hard_count' => 0,
            'pass_threshold_percent' => 50,
            'show_review_after_submit' => true,
            'is_active' => true,
        ]);

        $student = User::create(['name' => 'طالب', 'email' => 'student@flow.test', 'password' => 'secret', 'role' => 'student']);

        $response = $this->actingAs($student)->getJson("/api/lessons/{$lesson->slug}");
        $response->assertStatus(200);

        $json = $response->json('data');
        $this->assertSame($blueprint->id, $json['lesson_exam']['id']);
        $this->assertSame('امتحان درس الجمع', $json['lesson_exam']['title']);

        // تعطيل الامتحان — يختفي من الاستجابة نهائيًا.
        $blueprint->update(['is_active' => false]);
        $disabled = $this->actingAs($student)->getJson("/api/lessons/{$lesson->slug}");
        $disabled->assertStatus(200);
        $this->assertNull($disabled->json('data.lesson_exam'));
    }
}

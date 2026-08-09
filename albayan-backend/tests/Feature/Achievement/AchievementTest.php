<?php

namespace Tests\Feature\Achievement;

use App\Domains\Achievement\Enums\AchievementMetric;
use App\Domains\Achievement\Models\Achievement;
use App\Domains\Achievement\Models\UserAchievement;
use App\Domains\Achievement\Services\AchievementEvaluator;
use App\Domains\Achievement\Services\AchievementService;
use App\Domains\Progress\Models\LessonCompletion;
use PHPUnit\Framework\Attributes\Test;
use Tests\Feature\Exam\BaseExamTestCase;

class AchievementTest extends BaseExamTestCase
{
    #[Test]
    public function guest_cannot_read_achievements(): void
    {
        $this->getJson('/api/achievements')->assertStatus(401);
    }

    #[Test]
    public function non_admin_cannot_manage_achievements(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/admin/achievements', [
                'metric' => 'lessons_completed',
                'threshold' => 1,
                'title' => 'وسم غير مصرّح',
            ])->assertStatus(403);
    }

    #[Test]
    public function lesson_completion_unlocks_achievement_and_returns_it_in_response(): void
    {
        $first = Achievement::create([
            'key' => 'first-lesson',
            'metric' => 'lessons_completed',
            'threshold' => 1,
            'title' => 'الخطوة الأولى',
            'icon' => 'Sprout',
        ]);
        Achievement::create([
            'key' => 'five-lessons',
            'metric' => 'lessons_completed',
            'threshold' => 5,
            'title' => 'خمسة دروس',
        ]);

        $this->actingAs($this->student);

        $this->postJson("/api/student/lessons/{$this->lessonOne->slug}/complete")
            ->assertOk()
            ->assertJsonPath('message', 'تم تسجيل إكمال الدرس.')
            ->assertJsonCount(1, 'unlocked_achievements')
            ->assertJsonPath('unlocked_achievements.0.key', 'first-lesson');

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->student->id,
            'achievement_id' => $first->id,
        ]);
        $this->assertDatabaseMissing('user_achievements', [
            'user_id' => $this->student->id,
            'achievement_id' => 2,
        ]);
    }

    #[Test]
    public function achievement_is_granted_only_once(): void
    {
        Achievement::create([
            'key' => 'first-lesson',
            'metric' => 'lessons_completed',
            'threshold' => 1,
            'title' => 'الخطوة الأولى',
        ]);

        $this->actingAs($this->student);

        $this->postJson("/api/student/lessons/{$this->lessonOne->slug}/complete")
            ->assertJsonCount(1, 'unlocked_achievements')
            ->assertOk();
        $this->postJson("/api/student/lessons/{$this->lessonOne->slug}/complete")
            ->assertJsonCount(0, 'unlocked_achievements')
            ->assertOk();

        $this->assertSame(1, UserAchievement::query()
            ->where('user_id', $this->student->id)
            ->count());
    }

    #[Test]
    public function inactive_achievement_is_not_granted(): void
    {
        Achievement::create([
            'key' => 'first-lesson',
            'metric' => 'lessons_completed',
            'threshold' => 1,
            'title' => 'مُعطّل',
            'is_active' => false,
        ]);

        $this->actingAs($this->student);

        $this->postJson("/api/student/lessons/{$this->lessonOne->slug}/complete")
            ->assertOk()
            ->assertJsonCount(0, 'unlocked_achievements');
    }

    #[Test]
    public function passing_an_exam_unlocks_exam_achievement(): void
    {
        $achievement = Achievement::create([
            'key' => 'first-exam',
            'metric' => 'exams_passed',
            'threshold' => 1,
            'title' => 'انتصار أول اختبار',
        ]);

        $mcq = $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ])->assertOk();

        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")
            ->assertOk()
            ->assertJsonPath('data.passed', true)
            ->assertJsonCount(1, 'unlocked_achievements')
            ->assertJsonPath('unlocked_achievements.0.key', 'first-exam');

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->student->id,
            'achievement_id' => $achievement->id,
        ]);
    }

    #[Test]
    public function failing_an_exam_does_not_unlock_pass_achievement(): void
    {
        Achievement::create([
            'key' => 'first-exam',
            'metric' => 'exams_passed',
            'threshold' => 1,
            'title' => 'انتصار أول اختبار',
        ]);

        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")
            ->assertOk()
            ->assertJsonPath('data.passed', false)
            ->assertJsonCount(0, 'unlocked_achievements');
    }

    #[Test]
    public function student_listing_shows_progress_and_lock_state(): void
    {
        $achievement = Achievement::create([
            'key' => 'two-lessons',
            'metric' => 'lessons_completed',
            'threshold' => 2,
            'title' => 'درسان',
            'sort_order' => 1,
        ]);

        $this->completeLessonFor($this->student, $this->lessonOne);

        $this->actingAs($this->student);

        $this->getJson('/api/achievements')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $achievement->id)
            ->assertJsonPath('data.0.progress', 1)
            ->assertJsonPath('data.0.unlocked', false);

        // إتمام الدرس الثاني يفتح العتبة — يمنحها المستمع (محاكاة ما يفعله الحدث).
        $this->completeLessonFor($this->student, $this->lessonTwo);
        app(AchievementService::class)->evaluateFor($this->student);

        $this->getJson('/api/achievements')
            ->assertOk()
            ->assertJsonPath('data.0.progress', 2)
            ->assertJsonPath('data.0.unlocked', true)
            ->assertJsonPath('data.0.metric_label', 'دروس مكتملة');
    }

    #[Test]
    public function admin_can_create_update_and_delete_achievement(): void
    {
        $this->actingAs($this->admin);

        $created = $this->postJson('/api/admin/achievements', [
            'metric' => 'correct_answers',
            'threshold' => 100,
            'title' => 'دقة مئوية',
            'icon' => 'Target',
        ])->assertStatus(201);

        $id = $created->json('data.id');

        $this->assertDatabaseHas('achievements', ['id' => $id, 'threshold' => 100]);

        $this->putJson("/api/admin/achievements/{$id}", [
            'metric' => 'correct_answers',
            'threshold' => 50,
            'title' => 'دقة خمسينية',
        ])->assertOk()
            ->assertJsonPath('data.threshold', 50)
            ->assertJsonPath('data.title', 'دقة خمسينية');

        // مفتاح تُرك فارغًا عند الإنشاء — وُلّد تلقائيًا (المفتاح المولَّد قابل للتحديث الآن).
        $this->putJson("/api/admin/achievements/{$id}", [
            'metric' => 'correct_answers',
            'threshold' => 25,
            'title' => 'ربع مئة',
        ])->assertOk();

        $this->deleteJson("/api/admin/achievements/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('achievements', ['id' => $id]);
    }

    #[Test]
    public function admin_validation_rejects_bad_metric(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/achievements', [
            'metric' => 'not-a-metric',
            'threshold' => 1,
            'title' => 'وسم خاطئ',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['metric']);
    }

    #[Test]
    public function courses_completed_and_streak_metrics_are_derived(): void
    {
        $this->completeLessonFor($this->student, $this->lessonOne);
        $this->completeLessonFor($this->student, $this->lessonTwo);

        $evaluator = app(AchievementEvaluator::class);

        // courseOne (دروسان) مكتمل؛ courseTwo لم يكتمل.
        $this->assertSame(1, $evaluator->value($this->student, AchievementMetric::CoursesCompleted));
        $this->assertSame(2, $evaluator->value($this->student, AchievementMetric::LessonsCompleted));

        // لا نشاط بالامتحانات بعد.
        $this->assertSame(0, $evaluator->value($this->student, AchievementMetric::ExamsPassed));
        $this->assertSame(0, $evaluator->value($this->student, AchievementMetric::CorrectAnswers));

        // سلسلة يومية: درسان في يومين مختلفين متتاليين.
        LessonCompletion::query()
            ->where('user_id', $this->student->id)
            ->where('lesson_id', $this->lessonOne->id)
            ->update(['completed_at' => now()->subDay()]);
        LessonCompletion::query()
            ->where('user_id', $this->student->id)
            ->where('lesson_id', $this->lessonTwo->id)
            ->update(['completed_at' => now()]);

        $this->assertSame(2, $evaluator->value($this->student, AchievementMetric::StreakDays));
    }
}

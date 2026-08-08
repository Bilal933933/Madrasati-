<?php

namespace Tests\Feature\Exam;

use App\Domains\Exam\Models\ExamAttempt;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\Test;

class ExamExpiryTest extends BaseExamTestCase
{
    #[Test]
    public function auto_expire_finalizes_overdue_attempts_with_grading(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        // تمرير الموعد النهائي
        ExamAttempt::query()->where('id', $attempt['id'])->update([
            'deadline_at' => Carbon::now()->subMinute(),
        ]);

        $count = $this->examAttemptService()->autoExpire();

        $this->assertSame(1, $count);

        $expired = ExamAttempt::findOrFail($attempt['id']);
        $this->assertSame('completed', $expired->status);
        $this->assertNotNull($expired->submitted_at);
        $this->assertNotNull($expired->score_percentage, 'الانتهاء التلقائي يجب أن يصدّق المحاولة');
    }

    #[Test]
    public function auto_expire_skips_active_attempts(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $this->postJson("/api/exams/{$blueprint->id}/start")->assertStatus(201);

        $count = $this->examAttemptService()->autoExpire();

        $this->assertSame(0, $count);
        $this->assertSame(1, ExamAttempt::where('status', 'in_progress')->count());
    }

    #[Test]
    public function expired_attempt_is_auto_finalized_when_starting_new_one(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['attempts_allowed' => 2, 'easy_count' => 1]);

        $this->actingAs($this->student);

        $this->postJson("/api/exams/{$blueprint->id}/start")->assertStatus(201);

        ExamAttempt::query()->where('status', 'in_progress')->update([
            'deadline_at' => Carbon::now()->subMinute(),
        ]);

        $second = $this->postJson("/api/exams/{$blueprint->id}/start");
        $second->assertStatus(201);

        $this->assertSame(2, $second->json('data.attempt_number'));
        $this->assertDatabaseHas('exam_attempts', [
            'blueprint_id' => $blueprint->id,
            'attempt_number' => 1,
            'status' => 'completed',
        ]);
    }

    #[Test]
    public function expired_in_progress_counts_against_attempts_allowed(): void
    {
        // حالة حدّية: محاولة منتهية تُحتسب ضمن المسموح — وبعدها يُرفض البدء
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['attempts_allowed' => 2, 'easy_count' => 1]);

        $this->actingAs($this->student);

        $this->postJson("/api/exams/{$blueprint->id}/start")->assertStatus(201);

        ExamAttempt::query()->where('status', 'in_progress')->update([
            'deadline_at' => Carbon::now()->subMinute(),
        ]);

        $second = $this->postJson("/api/exams/{$blueprint->id}/start");
        $second->assertStatus(201);
        $this->postJson("/api/exams/attempts/{$second->json('data.id')}/submit")->assertOk();

        $this->postJson("/api/exams/{$blueprint->id}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function answering_an_expired_attempt_is_rejected(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        ExamAttempt::query()->where('id', $attempt['id'])->update([
            'deadline_at' => Carbon::now()->subMinute(),
        ]);

        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($this->makeMcq($this->lessonOne)),
        ])->assertStatus(422);
    }
}

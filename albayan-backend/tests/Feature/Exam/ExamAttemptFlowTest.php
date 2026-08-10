<?php

namespace Tests\Feature\Exam;

use App\Domains\Exam\Models\BankQuestion;
use App\Domains\Exam\Models\BankQuestionOption;
use App\Domains\Exam\Models\ExamAttempt;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;

class ExamAttemptFlowTest extends BaseExamTestCase
{
    #[Test]
    public function student_cannot_start_locked_exam(): void
    {
        $blueprint = $this->makeBlueprint();

        $this->actingAs($this->student)
            ->postJson("/api/exams/{$blueprint->id}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function student_can_start_unlocked_exam(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->makeTrueFalse($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1, 'medium_count' => 1]);

        $response = $this->actingAs($this->student)
            ->postJson("/api/exams/{$blueprint->id}/start");

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.total_questions', 2);

        $this->assertDatabaseHas('exam_attempts', [
            'user_id' => $this->student->id,
            'blueprint_id' => $blueprint->id,
            'attempt_number' => 1,
            'status' => 'in_progress',
        ]);
    }

    #[Test]
    public function inactive_exam_cannot_be_started(): void
    {
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['is_active' => false]);

        $this->actingAs($this->student)
            ->postJson("/api/exams/{$blueprint->id}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function exam_with_no_bank_questions_cannot_be_started(): void
    {
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student)
            ->postJson("/api/exams/{$blueprint->id}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function student_can_save_answers_and_submit_for_grading(): void
    {
        $mcq = $this->makeMcq($this->lessonOne);
        $tf = $this->makeTrueFalse($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1, 'medium_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $questions = collect($attempt['questions']);

        $mcqInExam = $questions->firstWhere('type', 'mcq');
        $tfInExam = $questions->firstWhere('type', 'true_false');

        // إجابة صحيحة على MCQ + إجابة خاطئة على صح/خطأ
        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ])->assertOk();

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$tfInExam['id']}", [
            'selected_boolean' => false,
        ])->assertOk();

        $submission = $this->postJson("/api/exams/attempts/{$attempt['id']}/submit");

        $submission->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.total_questions', 2)
            ->assertJsonPath('data.correct_count', 1)
            ->assertJsonPath('data.score_percentage', 50)
            ->assertJsonPath('data.passed', true);
    }

    #[Test]
    public function empty_submission_grades_zero_and_fails(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")
            ->assertOk()
            ->assertJsonPath('data.correct_count', 0)
            ->assertJsonPath('data.score_percentage', 0)
            ->assertJsonPath('data.passed', false);
    }

    #[Test]
    public function passing_threshold_is_respected(): void
    {
        $mcq = $this->makeMcq($this->lessonOne);
        $tf = $this->makeTrueFalse($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1, 'medium_count' => 1, 'pass_threshold_percent' => 80]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $questions = collect($attempt['questions']);

        $mcqInExam = $questions->firstWhere('type', 'mcq');
        $tfInExam = $questions->firstWhere('type', 'true_false');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ])->assertOk();

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$tfInExam['id']}", [
            'selected_boolean' => false,
        ])->assertOk();

        // 50% < 80% → راسب
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")
            ->assertOk()
            ->assertJsonPath('data.passed', false);
    }

    #[Test]
    public function attempts_limit_is_enforced(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['attempts_allowed' => 1, 'easy_count' => 1]);

        $this->actingAs($this->student);

        $first = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$first['id']}/submit")->assertOk();

        $this->postJson("/api/exams/{$blueprint->id}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function cannot_start_while_in_progress_attempt_exists(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $this->postJson("/api/exams/{$blueprint->id}/start")->assertStatus(201);

        $this->postJson("/api/exams/{$blueprint->id}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function attempt_number_increments_per_attempt(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['attempts_allowed' => 3, 'easy_count' => 1]);

        $this->actingAs($this->student);

        $first = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->assertSame(1, $first['attempt_number']);

        $this->postJson("/api/exams/attempts/{$first['id']}/submit")->assertOk();

        $second = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->assertSame(2, $second['attempt_number']);
    }

    #[Test]
    public function submitted_attempt_cannot_be_answered_again(): void
    {
        $mcq = $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ])->assertStatus(422);
    }

    #[Test]
    public function double_submit_is_rejected(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")
            ->assertStatus(422);
    }

    #[Test]
    public function student_cannot_answer_question_of_another_exam(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();

        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $otherAttempt = ExamAttempt::create([
            'blueprint_id' => $blueprint->id,
            'user_id' => $this->student->id,
            'attempt_number' => 99,
            'status' => 'in_progress',
            'total_questions' => 1,
        ]);

        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$otherAttempt->id}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($this->makeMcq($this->lessonOne)),
        ])->assertStatus(404);
    }

    #[Test]
    public function student_cannot_answer_with_option_from_another_question(): void
    {
        $this->completeScopeForStudent();

        $other = BankQuestion::create([
            'lesson_id' => $this->lessonOne->id,
            'type' => 'mcq',
            'content' => 'سؤال منفصل',
            'difficulty' => 'hard',
            'is_active' => true,
        ]);
        $foreignOption = BankQuestionOption::create([
            'bank_question_id' => $other->id,
            'content' => 'خيار أجنبي',
            'is_correct' => true,
            'sort_order' => 1,
        ]);

        $this->makeMcq($this->lessonOne);
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $foreignOption->id,
        ])->assertStatus(422);
    }

    #[Test]
    public function snapshot_preserves_question_at_creation_time(): void
    {
        $this->completeScopeForStudent();
        $this->makeMcq($this->lessonOne);
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $stored = DB::table('exam_attempt_questions')
            ->where('exam_attempt_id', $attempt['id'])
            ->first();

        $snapshot = json_decode($stored->question_snapshot, true);
        $this->assertSame('ما هو الرقم الصحيح؟', $snapshot['content']);
        $this->assertArrayHasKey('correct_option_id', $snapshot, 'اللقطة تُخزّن الحل للتصحيح');
    }

    #[Test]
    public function my_attempts_index_returns_attempts_and_stats(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $response = $this->getJson('/api/exams/attempts');

        $response->assertOk()
            ->assertJsonPath('stats.total', 1)
            ->assertJsonPath('stats.completed', 1)
            ->assertJsonPath('stats.in_progress', 0)
            ->assertJsonPath('stats.average_percentage', 0)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.exam_title', 'امتحان الدرس')
            ->assertJsonPath('data.0.exam_type_label', 'امتحان الدرس')
            ->assertJsonPath('data.0.status', 'completed');

        $response->assertJsonMissingPath('data.0.correct_option_id');
    }

    #[Test]
    public function my_attempts_index_is_scoped_to_current_user(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);
        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->actingAs($this->otherStudent)
            ->getJson('/api/exams/attempts')
            ->assertOk()
            ->assertJsonPath('stats.total', 0)
            ->assertJsonCount(0, 'data');
    }
}

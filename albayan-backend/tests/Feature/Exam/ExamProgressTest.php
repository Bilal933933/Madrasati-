<?php

namespace Tests\Feature\Exam;

use PHPUnit\Framework\Attributes\Test;

class ExamProgressTest extends BaseExamTestCase
{
    #[Test]
    public function student_can_save_and_read_attempt_progress(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $attemptId = $attempt['id'];
        $questionId = $attempt['questions'][0]['id'];

        // الحفظ
        $this->putJson("/api/exams/attempts/{$attemptId}/progress", [
            'current_index' => 0,
            'flagged_question_ids' => [$questionId],
        ])->assertOk()->assertJsonPath('data.current_index', 0);

        // القراءة عبر تفاصيل المحاولة
        $this->getJson("/api/exams/attempts/{$attemptId}")
            ->assertOk()
            ->assertJsonPath('data.current_index', 0)
            ->assertJsonPath('data.flagged_question_ids', [$questionId]);

        $this->assertDatabaseHas('exam_progress', [
            'user_id' => $this->student->id,
            'exam_attempt_id' => $attemptId,
            'current_index' => 0,
        ]);
    }

    #[Test]
    public function progress_is_upserted_single_row_per_attempt(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $attemptId = $attempt['id'];

        $this->putJson("/api/exams/attempts/{$attemptId}/progress", [
            'current_index' => 0,
            'flagged_question_ids' => [],
        ])->assertOk();

        $this->putJson("/api/exams/attempts/{$attemptId}/progress", [
            'current_index' => 0,
            'flagged_question_ids' => [],
        ])->assertOk();

        $this->assertDatabaseCount('exam_progress', 1);
    }

    #[Test]
    public function out_of_range_index_is_rejected(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/progress", [
            'current_index' => 99,
            'flagged_question_ids' => [],
        ])->assertStatus(422);
    }

    #[Test]
    public function foreign_question_flag_is_rejected(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/progress", [
            'current_index' => 0,
            'flagged_question_ids' => [999999],
        ])->assertStatus(422);
    }

    #[Test]
    public function student_cannot_save_progress_for_another_students_attempt(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->actingAs($this->otherStudent)
            ->putJson("/api/exams/attempts/{$attempt['id']}/progress", [
                'current_index' => 0,
                'flagged_question_ids' => [],
            ])->assertStatus(422);
    }

    #[Test]
    public function submitted_attempt_progress_is_rejected(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $this->putJson("/api/exams/attempts/{$attempt['id']}/progress", [
            'current_index' => 0,
            'flagged_question_ids' => [],
        ])->assertStatus(422);
    }
}

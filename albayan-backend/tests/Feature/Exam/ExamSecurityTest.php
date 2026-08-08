<?php

namespace Tests\Feature\Exam;

use PHPUnit\Framework\Attributes\Test;

class ExamSecurityTest extends BaseExamTestCase
{
    #[Test]
    public function student_never_sees_correct_answers_while_taking_exam(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->makeTrueFalse($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1, 'medium_count' => 1]);

        $this->actingAs($this->student);

        $started = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $attemptId = $started['id'];

        $detail = $this->getJson("/api/exams/attempts/{$attemptId}");
        $detail->assertOk()->assertJsonPath('data.revealed', false);

        foreach ($detail->json('data.questions') as $question) {
            $this->assertArrayNotHasKey('correct_option_id', $question, 'لا يُكشف الخيار الصحيح أثناء الأداء');
            $this->assertArrayNotHasKey('correct_boolean', $question, 'لا تُكشف إجابة صح/خطأ أثناء الأداء');
            $this->assertArrayNotHasKey('is_correct', $question, 'لا تُكشف صحّة الإجابة أثناء الأداء');
            $this->assertArrayNotHasKey('explanation', $question, 'لا يُكشف الشرح أثناء الأداء');
            if ($question['type'] === 'mcq') {
                foreach ($question['options'] as $option) {
                    $this->assertArrayNotHasKey('is_correct', $option, 'لا يُكشف الخيار الصحيح داخل الخيارات');
                }
            }
        }
    }

    #[Test]
    public function saving_an_answer_does_not_return_correctness(): void
    {
        $mcq = $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $saved = $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ]);

        $saved->assertOk()->assertJsonMissingPath('data.is_correct');
    }

    #[Test]
    public function review_reveals_answers_when_allowed(): void
    {
        $mcq = $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['show_review_after_submit' => true, 'easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ])->assertOk();

        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $review = $this->getJson("/api/exams/attempts/{$attempt['id']}");
        $review->assertOk()->assertJsonPath('data.revealed', true);

        $reviewMcq = collect($review->json('data.questions'))->firstWhere('type', 'mcq');
        $this->assertArrayHasKey('correct_option_id', $reviewMcq);
        $this->assertArrayHasKey('is_correct', $reviewMcq);
        $this->assertSame($this->correctOptionOf($mcq), $reviewMcq['correct_option_id']);
    }

    #[Test]
    public function review_never_reveals_answers_when_disabled(): void
    {
        $mcq = $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['show_review_after_submit' => false, 'easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $mcqInExam = collect($attempt['questions'])->firstWhere('type', 'mcq');

        $this->putJson("/api/exams/attempts/{$attempt['id']}/questions/{$mcqInExam['id']}", [
            'selected_option_id' => $this->correctOptionOf($mcq),
        ])->assertOk();

        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $review = $this->getJson("/api/exams/attempts/{$attempt['id']}");
        $review->assertOk()->assertJsonPath('data.revealed', false);

        $reviewMcq = collect($review->json('data.questions'))->firstWhere('type', 'mcq');
        $this->assertArrayNotHasKey('correct_option_id', $reviewMcq);
        $this->assertArrayNotHasKey('is_correct', $reviewMcq);
    }

    #[Test]
    public function student_cannot_access_another_students_attempt(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeLessonFor($this->otherStudent, $this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);
        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->actingAs($this->otherStudent)
            ->getJson("/api/exams/attempts/{$attempt['id']}")
            ->assertStatus(422);
    }

    #[Test]
    public function admin_cannot_see_attempt_via_public_endpoint_of_other_student(): void
    {
        // المشرف ليس طالبًا، والتحقق من الملكية يمنع ذلك
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);
        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');

        $this->actingAs($this->admin)
            ->getJson("/api/exams/attempts/{$attempt['id']}")
            ->assertStatus(422);
    }

    #[Test]
    public function my_attempts_lists_only_own_submitted_attempts(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScenarioForTwoStudents();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);
        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $response = $this->getJson("/api/exams/{$blueprint->id}/attempts");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.attempt_number', 1)
            ->assertJsonPath('data.0.status', 'completed');
    }

    private function completeScenarioForTwoStudents(): void
    {
        $this->completeLessonFor($this->student, $this->lessonOne);
        $this->completeLessonFor($this->otherStudent, $this->lessonOne);
    }
}

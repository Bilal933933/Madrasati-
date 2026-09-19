<?php

namespace Tests\Feature\Exam;

use App\Domains\Exam\Models\BankQuestion;
use App\Domains\Exam\Models\ExamAttemptQuestion;
use App\Domains\Exam\Services\ExamAttemptService;
use App\Domains\Exam\Services\ExamGradingService;
use App\Jobs\GradeExamAttemptJob;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

/**
 * تدفق التصحيح المختلط: حتمي فوري (mcq/true_false) + ذكي عبر NestJS (short_answer/essay/numeric).
 * يغطي: التفريع عند التسليم، الـ Job، pending_manual عند الفشل، وبناء حمولة كل نوع.
 */
class AiGradingFlowTest extends BaseExamTestCase
{
    /* --------------------------- بذر مساعد --------------------------- */

    protected function makeShortAnswer(string $difficulty = 'easy', string $content = 'في أي مدينة تقع برج إيفل؟'): BankQuestion
    {
        return BankQuestion::create([
            'lesson_id' => $this->lessonOne->id,
            'type' => 'short_answer',
            'content' => $content,
            'difficulty' => $difficulty,
            'is_active' => true,
            'model_answer' => 'باريس',
            'accepted_answers' => ['مدينة باريس', 'paris'],
            'case_sensitive' => false,
        ]);
    }

    protected function makeEssay(string $difficulty = 'easy', string $content = 'اشرح دورة الماء في الطبيعة.'): BankQuestion
    {
        return BankQuestion::create([
            'lesson_id' => $this->lessonOne->id,
            'type' => 'essay',
            'content' => $content,
            'difficulty' => $difficulty,
            'is_active' => true,
            'model_answer' => 'تبخر ثم تكاثف ثم هطول',
            'rubric' => [
                ['criterion' => 'الدقة العلمية'],
                ['criterion' => 'التنظيم'],
            ],
        ]);
    }

    protected function makeNumeric(string $difficulty = 'easy', string $content = 'كم يساوي 2 + 2؟'): BankQuestion
    {
        return BankQuestion::create([
            'lesson_id' => $this->lessonOne->id,
            'type' => 'numeric',
            'content' => $content,
            'difficulty' => $difficulty,
            'is_active' => true,
            'correct_value' => 4,
            'tolerance' => 0,
            'units' => null,
        ]);
    }

    /**
     * محاولة حقيقية عبر الخدمة (بناء snapshot كامل) + الإجابة على كل الأسئلة.
     *
     * @param  array<string, mixed>  $answersByType  type => قيمة الإجابة
     */
    protected function startAndAnswerAttempt(array $blueprintOverrides = [], ?callable $answerCustomizer = null)
    {
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint($blueprintOverrides);
        $attempt = $this->examAttemptService()->start($this->student, $blueprint);

        foreach ($attempt->questions as $question) {
            $data = $this->buildAnswerFor($question);
            if ($answerCustomizer) {
                $answerCustomizer($question, $data);
            }
            $this->examAttemptService()->answer($attempt, $question, $data);
        }

        return [$blueprint, $attempt->fresh()];
    }

    /**
     * @return array{selected_option_id?: int, selected_boolean?: bool, selected_text?: string}
     */
    protected function buildAnswerFor(ExamAttemptQuestion $question): array
    {
        return match ($question->snapshotType()) {
            'mcq' => [
                'selected_option_id' => collect($question->question_snapshot['options'])
                    ->firstWhere('is_correct', true)['id'],
            ],
            'true_false' => ['selected_boolean' => $question->snapshotCorrectBoolean()],
            default => ['selected_text' => 'إجابة الطالب النصية'],
        };
    }

    /* --------------------------- الاختبارات --------------------------- */

    public function test_deterministic_only_attempt_grades_synchronously_without_job(): void
    {
        Queue::fake();

        $this->makeMcq($this->lessonOne);

        [, $attempt] = $this->startAndAnswerAttempt();

        $graded = $this->examAttemptService()->submit($attempt);

        Queue::assertNothingPushed();
        $this->assertEquals('graded', $graded->attempt_status);
        $this->assertNotNull($graded->graded_at);
        $this->assertTrue($graded->passed);
        $this->assertEquals(100.0, $graded->percentage);
        $this->assertTrue($graded->questions->first()->is_correct);
    }

    public function test_submit_with_ai_questions_dispatches_grading_job_and_locks_attempt(): void
    {
        Queue::fake();

        $this->makeShortAnswer();
        [, $attempt] = $this->startAndAnswerAttempt();

        $submitted = $this->examAttemptService()->submit($attempt);

        Queue::assertPushedOn('grading', GradeExamAttemptJob::class);
        $this->assertEquals('submitted', $submitted->attempt_status);
        $this->assertTrue($submitted->is_locked);
        $this->assertNull($submitted->percentage); // لم يكتمل التصحيح بعد
    }

    public function test_grading_job_grades_deterministic_locally_and_ai_via_nestjs(): void
    {
        $this->makeMcq($this->lessonOne, 'easy');
        $this->makeShortAnswer('medium');

        [, $attempt] = $this->startAndAnswerAttempt([
            'easy_count' => 1,
            'medium_count' => 1,
        ]);
        Queue::fake();
        $submitted = $this->examAttemptService()->submit($attempt);

        $aiQuestion = $submitted->questions->firstWhere(fn ($q) => $q->snapshotType() === 'short_answer');
        $this->assertNotNull($aiQuestion);

        Http::fake([
            '*/api/exam/grade' => Http::response([
                'results' => [
                    [
                        'questionId' => $aiQuestion->id,
                        'status' => 'graded',
                        'score' => 1.0,
                        'aiGrade' => [
                            'correct' => true,
                            'confidence' => 0.95,
                            'feedback' => 'إجابة صحيحة',
                        ],
                    ],
                ],
            ], 200),
        ]);

        (new GradeExamAttemptJob($submitted->id))->handle(
            app(ExamAttemptService::class),
            app(ExamGradingService::class),
        );

        $attempt = $submitted->fresh(['questions']);
        $this->assertEquals('graded', $attempt->attempt_status);
        $this->assertNotNull($attempt->graded_at);
        $this->assertNull($attempt->grading_errors);

        foreach ($attempt->questions as $question) {
            if ($question->isDeterministic()) {
                $this->assertTrue($question->is_correct);
            } else {
                $this->assertTrue($question->is_correct);
                $this->assertSame(1.0, (float) $question->score);
                $this->assertSame('إجابة صحيحة', $question->ai_grade['feedback']);
                $this->assertFalse($question->isPendingManual());
            }
        }

        $this->assertEquals(100.0, $attempt->percentage);
        $this->assertTrue($attempt->passed);
    }

    public function test_ai_service_failure_marks_pending_manual_and_excludes_from_percentage(): void
    {
        $this->makeMcq($this->lessonOne, 'easy');
        $this->makeShortAnswer('medium');

        [, $attempt] = $this->startAndAnswerAttempt([
            'easy_count' => 1,
            'medium_count' => 1,
        ]);
        Queue::fake();
        $submitted = $this->examAttemptService()->submit($attempt);

        Http::fake([
            '*/api/exam/grade' => Http::response(['message' => 'boom'], 500),
        ]);

        (new GradeExamAttemptJob($submitted->id))->handle(
            app(ExamAttemptService::class),
            app(ExamGradingService::class),
        );

        $attempt = $submitted->fresh(['questions']);
        $this->assertEquals('graded', $attempt->attempt_status); // لا تعليق للواجهة

        $aiQuestion = $attempt->questions->firstWhere(fn ($q) => $q->isAiGraded());
        $mcqQuestion = $attempt->questions->firstWhere(fn ($q) => $q->isDeterministic());

        $this->assertTrue($aiQuestion->isPendingManual());
        $this->assertFalse((bool) $aiQuestion->is_correct);
        $this->assertStringContainsString('pending_manual', json_encode($aiQuestion->ai_grade));

        // الحتمي سليم والنسبة تُحسب من المصحح فقط (1/1 وليس 1/2)
        $this->assertTrue((bool) $mcqQuestion->is_correct);
        $this->assertEquals(1.0, $attempt->max_score);
        $this->assertEquals(100.0, $attempt->percentage);
        $this->assertTrue((bool) $attempt->passed);
    }

    public function test_missing_result_for_question_defaults_to_error_status(): void
    {
        $this->makeShortAnswer('easy', 'س1');
        $this->makeShortAnswer('medium', 'س2');

        [, $attempt] = $this->startAndAnswerAttempt([
            'easy_count' => 1,
            'medium_count' => 1,
        ]);
        Queue::fake();
        $submitted = $this->examAttemptService()->submit($attempt);

        $answered = $submitted->questions->first();
        $otherId = $submitted->questions->skip(1)->first()->id;

        Http::fake([
            '*/api/exam/grade' => Http::response([
                'results' => [
                    ['questionId' => $answered->id, 'status' => 'graded', 'score' => 0.5, 'aiGrade' => ['correct' => false, 'feedback' => 'جزئي']],
                ],
            ], 200),
        ]);

        (new GradeExamAttemptJob($submitted->id))->handle(
            app(ExamAttemptService::class),
            app(ExamGradingService::class),
        );

        $attempt = $submitted->fresh(['questions']);
        $missing = $attempt->questions->firstWhere('id', $otherId);
        $found = $attempt->questions->firstWhere('id', $answered->id);

        $this->assertFalse($missing->isPendingManual());
        $this->assertFalse((bool) $missing->is_correct);
        $this->assertSame('error', $missing->ai_grade['status']);

        // 0.5 + 0 من مجموع مصححَين = 25%
        $this->assertEquals(25.0, $attempt->percentage);
        $this->assertFalse((bool) $attempt->passed);
        $this->assertSame(0.5, (float) $found->score);
    }

    public function test_nestjs_payload_contains_type_specific_snapshot_fields(): void
    {
        $this->makeNumeric();

        [, $attempt] = $this->startAndAnswerAttempt();
        Queue::fake();
        $submitted = $this->examAttemptService()->submit($attempt);

        Http::fake(['*/api/exam/grade' => Http::response(['results' => []], 200)]);

        (new GradeExamAttemptJob($submitted->id))->handle(
            app(ExamAttemptService::class),
            app(ExamGradingService::class),
        );

        Http::assertSent(function ($request) use ($submitted) {
            $body = $request->data();
            $questionPayload = $body['questions'][0] ?? null;
            $dbQuestion = $submitted->questions->first();

            return $request->hasHeader('x-ai-service-key')
                && str_ends_with($request->url(), '/api/exam/grade')
                && $questionPayload !== null
                && $questionPayload['questionId'] === $dbQuestion->id
                && $questionPayload['type'] === 'numeric'
                && $questionPayload['studentAnswer'] === 'إجابة الطالب النصية'
                && isset($questionPayload['question'])
                && array_key_exists('correctValue', $questionPayload)
                && array_key_exists('tolerance', $questionPayload);
        });
    }

    public function test_essay_correctness_derived_from_score_percent_threshold(): void
    {
        $this->makeEssay();

        [, $attempt] = $this->startAndAnswerAttempt();
        Queue::fake();
        $submitted = $this->examAttemptService()->submit($attempt);
        $essayId = $submitted->questions->firstWhere(fn ($q) => $q->snapshotType() === 'essay')->id;

        Http::fake([
            '*/api/exam/grade' => Http::response([
                'results' => [
                    [
                        'questionId' => $essayId,
                        'status' => 'graded',
                        'score' => 0.65,
                        'aiGrade' => [
                            'score_percent' => 65,
                            'criteria' => [['criterion' => 'الدقة العلمية', 'score' => 70, 'comment' => 'جيد']],
                            'feedback' => 'إجابة مقبولة',
                            'strengths' => ['واضحة'],
                            'improvements' => ['أضف أمثلة'],
                        ],
                    ],
                ],
            ], 200),
        ]);

        (new GradeExamAttemptJob($submitted->id))->handle(
            app(ExamAttemptService::class),
            app(ExamGradingService::class),
        );

        $essay = $submitted->fresh(['questions'])->questions->firstWhere('id', $essayId);

        // 65% ≥ 50% → صحيح، مع حفظ الدرجة الجزئية والتغذية الراجعة
        $this->assertTrue((bool) $essay->is_correct);
        $this->assertSame(0.65, (float) $essay->score);
        $this->assertSame(65, $essay->ai_grade['score_percent']);
        $this->assertSame('إجابة مقبولة', $essay->ai_grade['feedback']);
    }

    public function test_numeric_partial_tolerance_score_flows_into_percentage(): void
    {
        $this->makeMcq($this->lessonOne, 'easy');
        $this->makeNumeric('medium');

        // طالب أصاب MCQ وأخطأ الرقمي جزئياً (score 0.5 مقبول بالتقريب)
        [, $attempt] = $this->startAndAnswerAttempt([
            'easy_count' => 1,
            'medium_count' => 1,
        ], answerCustomizer: function (ExamAttemptQuestion $question, array &$data): void {
            if ($question->snapshotType() === 'numeric') {
                $data['selected_text'] = '3.9';
            }
        });

        Queue::fake();
        $submitted = $this->examAttemptService()->submit($attempt);
        $numericId = $submitted->questions->firstWhere(fn ($q) => $q->snapshotType() === 'numeric')->id;
        $this->assertNotNull($numericId);

        Http::fake([
            '*/api/exam/grade' => Http::response([
                'results' => [
                    ['questionId' => $numericId, 'status' => 'graded', 'score' => 0.5, 'aiGrade' => ['correct' => false, 'accepted' => true, 'feedback' => 'مقبول بالتقريب']],
                ],
            ], 200),
        ]);

        (new GradeExamAttemptJob($submitted->id))->handle(
            app(ExamAttemptService::class),
            app(ExamGradingService::class),
        );

        $attempt = $submitted->fresh(['questions']);

        // (1 + 0.5) / 2 = 75%
        $this->assertEquals(75.0, $attempt->percentage);
        $this->assertEqualsWithDelta(1.5, $attempt->total_score, 0.001);
        $this->assertTrue((bool) $attempt->passed);
    }
}

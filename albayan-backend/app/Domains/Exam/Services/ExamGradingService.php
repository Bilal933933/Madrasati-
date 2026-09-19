<?php

namespace App\Domains\Exam\Services;

use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamAttemptQuestion;

/**
 * تصحيح المحاولة — يدعم النوعين:
 * 1) حتمي (mcq/true_false): تصحيح محلي فوري
 * 2) ذكي (short_answer/essay/numeric): تفويض إلى AiGradingService (عبر NestJS)
 *
 * الدرجة النهائية = مجموع درجات الأسئلة / عدد الأسئلة المصححة (باستثناء pending_manual).
 */
class ExamGradingService
{
    public function __construct(
        private readonly AiGradingService $aiGradingService,
    ) {}

    /**
     * تصحيح كامل المحاولة وتحديث درجاتها.
     */
    public function grade(ExamAttempt $attempt): ExamAttempt
    {
        $questions = $attempt->questions()->get();

        // 1) تصحيح الأسئلة الحتمية محليًا
        $deterministicQuestions = $questions->filter(fn (ExamAttemptQuestion $q) => $q->isDeterministic());
        $deterministicQuestions->each(function (ExamAttemptQuestion $question) {
            $question->is_correct = $this->isCorrectDeterministic($question);
            $question->score = $question->is_correct ? 1.0 : 0.0;
            $question->save();
        });

        // 2) جمع الأسئلة الذكية للتصحيح عبر المساعد
        $aiQuestions = $questions->filter(fn (ExamAttemptQuestion $q) => $q->isAiGraded());

        if ($aiQuestions->isNotEmpty()) {
            $aiResults = $this->aiGradingService->gradeMultiple($aiQuestions->values()->all(), $attempt);

            foreach ($aiResults as $result) {
                $question = $questions->find($result['question_id']);
                if (! $question) {
                    continue;
                }

                $question->is_correct = $result['correct'];
                $question->score = $result['score'] ?? 0.0;
                $question->ai_grade = $result['ai_grade'];
                $question->save();
            }
        }

        // 3) حساب الدرجة الإجمالية (تجاهل pending_manual)
        $scoredQuestions = $questions->filter(fn (ExamAttemptQuestion $q) => $q->getScore() !== null && ! $q->isPendingManual());
        $totalScore = $scoredQuestions->sum('score');
        $maxScore = $scoredQuestions->count();

        $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0.0;
        $threshold = $attempt->blueprint->pass_threshold_percent;
        $passed = $percentage >= $threshold;

        // 4) تحديث المحاولة (حقلين للتوافق مع الكود القديم والجديد)
        $attempt->update([
            'attempt_status' => 'graded',
            'graded_at' => now(),
            'correct_count' => $questions->where('is_correct', true)->count(),
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'percentage' => $percentage,
            'score_percentage' => $percentage, // حقل قديم للتوافق
            'passed' => $passed,
        ]);

        return $attempt->load('questions');
    }

    /**
     * تصحيح الأسئلة الحتمية فقط (mcq/true_false) — يستخدم عند التسليم فوراً.
     */
    public function gradeDeterministicQuestions(ExamAttempt $attempt): void
    {
        $questions = $attempt->questions()->get();
        $deterministicQuestions = $questions->filter(fn (ExamAttemptQuestion $q) => $q->isDeterministic());

        $deterministicQuestions->each(function (ExamAttemptQuestion $question) {
            $question->is_correct = $this->isCorrectDeterministic($question);
            $question->score = $question->is_correct ? 1.0 : 0.0;
            $question->save();
        });
    }

    /**
     * التحقق مما إذا كانت المحاولة تحتوي على أسئلة ذكية.
     */
    public function hasAiQuestions(ExamAttempt $attempt): bool
    {
        return $attempt->questions()
            ->get()
            ->contains(fn (ExamAttemptQuestion $q) => $q->isAiGraded());
    }

    /**
     * تصحيح سؤال من الـ snapshot (مصدر الحقيقة المعزول).
     */
    private function isCorrectDeterministic(ExamAttemptQuestion $question): bool
    {
        $type = $question->snapshotType();

        if ($type === 'true_false') {
            $correct = $question->snapshotCorrectBoolean();

            return $correct !== null && $question->selected_boolean === $correct;
        }

        if ($type === 'mcq') {
            $correct = $question->snapshotCorrectOptionId();

            return $correct !== null && $question->selected_option_id === $correct;
        }

        return false;
    }

    /**
     * تصحيح سؤال واحد حتمي (للاستخدام في سياق التسليم الفوري).
     */
    public function gradeDeterministic(ExamAttemptQuestion $question): ExamAttemptQuestion
    {
        $question->is_correct = $this->isCorrectDeterministic($question);
        $question->score = $question->is_correct ? 1.0 : 0.0;
        $question->save();

        return $question->fresh();
    }
}

<?php

namespace App\Domains\Exam\Services;

use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamAttemptQuestion;

/**
 * تصحيح المحاولة تلقائيًا — وزن متساوٍ لكل سؤال (درجة واحدة).
 * النسبة = صحيح / إجمالي × 100؛ النجاح وفق عتبة blueprint.
 */
class ExamGradingService
{
    /**
     * تصحيح كامل المحاولة وتحديث درجاتها.
     */
    public function grade(ExamAttempt $attempt): ExamAttempt
    {
        $threshold = $attempt->blueprint->pass_threshold_percent;

        $attempt->questions()
            ->get()
            ->each(function (ExamAttemptQuestion $question) {
                $question->is_correct = $this->isCorrect($question);
                $question->save();
            });

        $correct = $attempt->questions()->where('is_correct', true)->count();
        $total = $attempt->total_questions ?: max($attempt->questions()->count(), 1);

        $percentage = round(($correct / $total) * 100, 2);

        $attempt->update([
            'correct_count' => $correct,
            'score_percentage' => $percentage,
            'passed' => round($percentage) >= $threshold,
        ]);

        return $attempt->load('questions');
    }

    /**
     * تصحيح سؤال من الـ snapshot (مصدر الحقيقة المعزول).
     */
    private function isCorrect(ExamAttemptQuestion $question): bool
    {
        $type = $question->question_snapshot['type'] ?? null;

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
}

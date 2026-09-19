<?php

namespace App\Domains\Exam\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * تفاصيل محاولة للطالب (أثناء الأداء أو المراجعة).
 *
 * يُترك في الـ snapshot محتوى السؤال وخياراته حسب نوع السؤال،
 * أما محتويات "الإجابة الصحيحة" فلا تُكشف إلا عند:
 *   - اكتمال المحاولة، و
 *   - تفعيل show_review_after_submit على تعريف الامتحان.
 */
class ExamAttemptDetailResource extends JsonResource
{
    public function __construct($resource, private readonly bool $revealAnswers = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $questions = $this->questions ?? collect();

        $questions = $questions->map(function ($q) {
            $type = $q->question_snapshot['type'] ?? null;

            $display = [
                'id' => $q->id,
                'type' => $type,
                'content' => $q->question_snapshot['content'] ?? null,
                'sort_order' => $q->sort_order,
                'selected_option_id' => $q->selected_option_id,
                'selected_boolean' => $q->selected_boolean,
                'selected_text' => $q->selected_text,
            ];

            // خيارات السؤال (بدون كشف الإجابة الصحيحة)
            if ($type === 'true_false') {
                $display['options'] = $q->question_snapshot['options'] ?? [];
            } elseif ($type === 'mcq') {
                $display['options'] = collect($q->question_snapshot['options'] ?? [])
                    ->map(function ($opt) {
                        return [
                            'id' => $opt['id'],
                            'content' => $opt['content'],
                            'sort_order' => $opt['sort_order'] ?? 0,
                        ];
                    })
                    ->values()
                    ->all();
            }

            // للأسئلة النصية/الرقمية: نعرض حقول الـ snapshot ذات الصلة (بدون model_answer قبل المراجعة)
            if ($type === 'short_answer') {
                $display['accepted_answers'] = $q->question_snapshot['accepted_answers'] ?? [];
                $display['case_sensitive'] = $q->question_snapshot['case_sensitive'] ?? false;
            } elseif ($type === 'essay') {
                $display['rubric'] = $q->question_snapshot['rubric'] ?? [];
            } elseif ($type === 'numeric') {
                $display['units'] = $q->question_snapshot['units'] ?? null;
                $display['tolerance'] = $q->question_snapshot['tolerance'] ?? 0;
            }

            // كشف الإجابات والدرجات بعد التسليم + تفعيل المراجعة
            if ($this->revealAnswers) {
                $display['is_correct'] = $q->is_correct;
                $display['score'] = $q->getScore();
                $display['explanation'] = $q->question_snapshot['explanation'] ?? null;

                if ($type === 'mcq') {
                    $display['correct_option_id'] = $q->snapshotCorrectOptionId();
                } elseif ($type === 'true_false') {
                    $display['correct_boolean'] = $q->snapshotCorrectBoolean();
                } elseif ($type === 'short_answer') {
                    $display['model_answer'] = $q->snapshotModelAnswer();
                    $display['accepted_answers'] = $q->snapshotAcceptedAnswers();
                } elseif ($type === 'essay') {
                    $display['model_answer'] = $q->snapshotModelAnswer();
                    $display['rubric'] = $q->snapshotRubric();
                } elseif ($type === 'numeric') {
                    $display['correct_value'] = $q->snapshotCorrectValue();
                    $display['tolerance'] = $q->snapshotTolerance();
                    $display['units'] = $q->snapshotUnits();
                }

                // تقييم المساعد (AI grade) — يكشف فقط بعد المراجعة
                if ($q->ai_grade !== null) {
                    $display['ai_grade'] = $q->ai_grade;
                }
            }

            return $display;
        });

        return [
            'id' => $this->id,
            'blueprint_id' => $this->blueprint_id,
            'attempt_number' => $this->attempt_number,
            'status' => $this->status,
            'attempt_status' => $this->attempt_status,
            'started_at' => $this->started_at?->toISOString(),
            'deadline_at' => $this->deadline_at?->toISOString(),
            'submitted_at' => $this->submitted_at?->toISOString(),
            'graded_at' => $this->graded_at?->toISOString(),
            'duration_minutes' => $this->blueprint?->duration_minutes,
            'total_questions' => $this->total_questions,
            'correct_count' => $this->correct_count,
            'total_score' => $this->total_score,
            'max_score' => $this->max_score,
            'percentage' => $this->percentage,
            'passed' => $this->passed,
            'is_locked' => $this->is_locked,
            'revealed' => $this->revealAnswers,
            'current_index' => $this->progress?->current_index ?? 0,
            'flagged_question_ids' => $this->progress?->flagged_question_ids ?? [],
            'questions' => $questions,
        ];
    }
}

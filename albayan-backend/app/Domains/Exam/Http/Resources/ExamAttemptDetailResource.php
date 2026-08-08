<?php

namespace App\Domains\Exam\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * تفاصيل محاولة للطالب (أثناء الأداء أو المراجعة).
 *
 * يُتُرك في الـ snapshot محتوى السؤال وخياراته حسب نوع السؤال،
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
            $display = [
                'id' => $q->id,
                'type' => $q->question_snapshot['type'] ?? null,
                'content' => $q->question_snapshot['content'] ?? null,
                'sort_order' => $q->sort_order,
                'selected_option_id' => $q->selected_option_id,
                'selected_boolean' => $q->selected_boolean,
            ];

            if ($q->question_snapshot['type'] === 'true_false') {
                $display['options'] = $q->question_snapshot['options'] ?? [];
            } else {
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

            if ($this->revealAnswers) {
                $display['is_correct'] = $q->is_correct;
                $display['correct_option_id'] = $q->snapshotCorrectOptionId();
                $display['correct_boolean'] = $q->snapshotCorrectBoolean();
                $display['explanation'] = $q->question_snapshot['explanation'] ?? null;
            }

            return $display;
        });

        return [
            'id' => $this->id,
            'blueprint_id' => $this->blueprint_id,
            'attempt_number' => $this->attempt_number,
            'status' => $this->status,
            'started_at' => $this->started_at?->toISOString(),
            'deadline_at' => $this->deadline_at?->toISOString(),
            'submitted_at' => $this->submitted_at?->toISOString(),
            'duration_minutes' => $this->blueprint?->duration_minutes,
            'total_questions' => $this->total_questions,
            'correct_count' => $this->correct_count,
            'score_percentage' => $this->score_percentage,
            'passed' => $this->passed,
            'revealed' => $this->revealAnswers,
            'current_index' => $this->progress?->current_index ?? 0,
            'flagged_question_ids' => $this->progress?->flagged_question_ids ?? [],
            'questions' => $questions,
        ];
    }
}

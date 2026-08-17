<?php

namespace App\Domains\Exam\Http\Resources;

use App\Domains\Exam\Enums\ExamType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * مورد تعريف الامتحان (Blueprint) — للإدارة والعرض.
 */
class ExamBlueprintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'exam_type' => $this->exam_type,
            'exam_type_label' => ExamType::tryFrom($this->exam_type)?->label(),
            'title' => $this->title,
            'description' => $this->description,
            'scope_name' => $this->scopeName(),
            'lesson_id' => $this->lesson_id,
            'course_id' => $this->course_id,
            'subject_id' => $this->subject_id,
            'grade_id' => $this->grade_id,
            'stage_id' => $this->stage_id,
            'month_no' => $this->month_no,
            'duration_minutes' => $this->duration_minutes,
            'attempts_allowed' => $this->attempts_allowed,
            'easy_count' => $this->easy_count,
            'medium_count' => $this->medium_count,
            'hard_count' => $this->hard_count,
            'total_questions' => $this->easy_count + $this->medium_count + $this->hard_count,
            'pass_threshold_percent' => $this->pass_threshold_percent,
            'show_review_after_submit' => $this->show_review_after_submit,
            'is_active' => $this->is_active,
            'requires_completion' => (bool) $this->requires_completion,
            'unlock_progress' => $this->unlock_progress,
            'attempts_left' => $this->attempts_left,
            'best_score' => $this->best_score,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

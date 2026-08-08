<?php

namespace App\Domains\Exam\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ملخّص محاولة — قائمة السجل / لوحة الطالب.
 */
class ExamAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'blueprint' => $this->whenLoaded('blueprint', fn () => new ExamBlueprintResource($this->blueprint)),
            'attempt_number' => $this->attempt_number,
            'status' => $this->status,
            'started_at' => $this->started_at?->toISOString(),
            'deadline_at' => $this->deadline_at?->toISOString(),
            'submitted_at' => $this->submitted_at?->toISOString(),
            'total_questions' => $this->total_questions,
            'correct_count' => $this->correct_count,
            'score_percentage' => $this->score_percentage,
            'passed' => $this->passed,
        ];
    }
}

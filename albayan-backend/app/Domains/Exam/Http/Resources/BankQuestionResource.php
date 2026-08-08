<?php

namespace App\Domains\Exam\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * مورد السؤال للبنك — يُستخدم في إدارة المشرف فقط (الإجابات الصحيحة مكشوفة).
 */
class BankQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'lesson_title' => $this->whenLoaded('lesson', fn () => $this->lesson?->title),
            'type' => $this->type,
            'content' => $this->content,
            'explanation' => $this->explanation,
            'correct_answer' => $this->correct_answer,
            'difficulty' => $this->difficulty,
            'is_active' => $this->is_active,
            'options' => BankQuestionOptionResource::collection($this->whenLoaded('options')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

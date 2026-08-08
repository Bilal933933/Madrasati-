<?php

namespace App\Domains\Exam\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * خيار سؤال بنك الأسئلة في وضع الإدارة.
 */
class BankQuestionOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bank_question_id' => $this->bank_question_id,
            'content' => $this->content,
            'is_correct' => $this->is_correct,
            'sort_order' => $this->sort_order,
        ];
    }
}

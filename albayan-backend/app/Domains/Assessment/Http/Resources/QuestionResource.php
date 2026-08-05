<?php

namespace App\Domains\Assessment\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() === true;

        return [
            'id' => $this->id,
            'assessment_id' => $this->assessment_id,
            'type' => $this->type,
            'content' => $this->content,
            'explanation' => $this->explanation,
            'sort_order' => $this->sort_order,
            'correct_answer' => $this->when($isAdmin && $this->type === 'true_false', $this->correct_answer),
            'options' => OptionResource::collection($this->whenLoaded('options')),
        ];
    }
}

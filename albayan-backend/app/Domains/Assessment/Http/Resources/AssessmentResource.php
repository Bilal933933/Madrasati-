<?php

namespace App\Domains\Assessment\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'paragraph_id' => $this->paragraph_id,
            'type' => $this->type,
            'title' => $this->title,
            'sort_order' => $this->sort_order,
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
        ];
    }
}

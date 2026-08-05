<?php

namespace App\Domains\Assessment\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() === true;

        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'content' => $this->content,
            'sort_order' => $this->sort_order,
            'is_correct' => $this->when($isAdmin, $this->is_correct),
        ];
    }
}

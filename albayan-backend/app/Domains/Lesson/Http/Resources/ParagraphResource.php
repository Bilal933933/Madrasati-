<?php

namespace App\Domains\Lesson\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParagraphResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'type' => $this->type,
            'slug' => $this->slug,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color,
            'content' => $this->content,
            'sort_order' => $this->sort_order,
        ];
    }
}

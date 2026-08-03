<?php

namespace App\Domains\Lesson\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color,
            'sort_order' => $this->sort_order,
            'is_published' => $this->is_published,
            'children' => ParagraphResource::collection($this->whenLoaded('paragraphs')),
        ];
    }
}

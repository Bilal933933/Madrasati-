<?php

namespace App\Domains\Curriculum\Http\Resources;

use App\Domains\Lesson\Http\Resources\LessonResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'section_id' => $this->section_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color,
            'sort_order' => $this->sort_order,
            'is_published' => $this->is_published,
            'children' => LessonResource::collection($this->whenLoaded('lessons')),
        ];
    }
}

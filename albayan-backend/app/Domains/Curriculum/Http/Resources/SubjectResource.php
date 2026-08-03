<?php

namespace App\Domains\Curriculum\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'grade_id' => $this->grade_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color,
            'sort_order' => $this->sort_order,
            'is_published' => $this->is_published,
            'children' => SectionResource::collection($this->whenLoaded('sections')),
        ];
    }
}

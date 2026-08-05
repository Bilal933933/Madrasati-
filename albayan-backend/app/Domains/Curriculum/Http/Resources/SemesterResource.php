<?php

namespace App\Domains\Curriculum\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SemesterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'grade_id' => $this->grade_id,
            'name' => $this->name,
            'sort_order' => $this->sort_order,
            'children' => SubjectResource::collection($this->whenLoaded('subjects')),
        ];
    }
}

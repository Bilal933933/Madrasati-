<?php

namespace App\Domains\Curriculum\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExploreStageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color,
            'grades_count' => $this->grades_count ?? 0,
        ];
    }
}

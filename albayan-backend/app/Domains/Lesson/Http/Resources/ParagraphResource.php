<?php

namespace App\Domains\Lesson\Http\Resources;

use App\Support\YouTubeUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParagraphResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'title' => $this->title,
            'type' => $this->type,
            'slug' => $this->slug,
            'image' => $this->image,
            'video' => $this->video,
            'video_embed' => YouTubeUrl::embed($this->video),
            'icon' => $this->icon,
            'color' => $this->color,
            'content' => $this->content ? json_decode($this->content, true) : null,
            'sort_order' => $this->sort_order,
        ];
    }
}

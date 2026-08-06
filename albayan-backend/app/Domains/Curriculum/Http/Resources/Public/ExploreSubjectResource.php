<?php

namespace App\Domains\Curriculum\Http\Resources\Public;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Lesson\Models\Lesson;
use App\Support\EstimatedDuration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExploreSubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $description = $this->relationLoaded('courses') && $this->courses->isNotEmpty()
            ? $this->courses->first()->description
            : null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color,
            'description' => $description ?? ('محتوى '.$this->name.' — المفاهيم الأساسية وتطبيقاتها.'),
            'units_count' => $this->units_count ?? 0,
            'lessons_count' => $this->lessons_count ?? 0,
            'units' => $this->whenLoaded('courses', fn () => $this->courses->map(fn (Course $course) => [
                'id' => $course->id,
                'name' => $course->name,
                'description' => $course->description,
                'image' => $course->image,
                'icon' => $course->icon,
                'color' => $course->color,
                'lessons' => $course->relationLoaded('lessons')
                    ? $course->lessons->map(fn (Lesson $lesson) => [
                        'id' => $lesson->id,
                        'slug' => $lesson->slug,
                        'title' => $lesson->title,
                        'image' => $lesson->image,
                        'color' => $lesson->color,
                        'blocks_count' => $lesson->blocks_count ?? 0,
                        'duration' => EstimatedDuration::fromBlockCount($lesson->blocks_count ?? 0),
                    ])->values()
                    : [],
            ])->values()),
        ];
    }
}

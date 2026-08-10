<?php

namespace App\Domains\Progress\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * درس مكتمل للطالب — بيانات الدرس + المادة + المقرر + تاريخ الإكمال.
 */
class CompletedLessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lesson = $this->lesson;
        $course = $lesson?->course;
        $subject = $course?->subject;

        return [
            'id' => $this->id,
            'lesson' => [
                'id' => $lesson?->id,
                'slug' => $lesson?->slug,
                'title' => $lesson?->title,
                'image' => $lesson?->image,
                'color' => $lesson?->color,
                'icon' => $lesson?->icon,
                'blocks_count' => $lesson?->blocks_count ?? 0,
            ],
            'subject' => [
                'id' => $subject?->id,
                'slug' => $subject?->slug,
                'name' => $subject?->name,
                'icon' => $subject?->icon,
                'color' => $subject?->color,
            ],
            'course_name' => $course?->name,
            'completed_at' => $this->completed_at?->toISOString(),
        ];
    }
}

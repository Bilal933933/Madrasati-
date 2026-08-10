<?php

namespace App\Domains\Progress\Http\Resources;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Lesson\Models\Lesson;
use App\Support\EstimatedDuration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * صفحة المقرر للطالب — بيانات المقرر وتقدمه + دروسه بحالة كل درس (مكتمل/مبدأ).
 */
class StudentCourseResource extends JsonResource
{
    /**
     * @param  array  $snapshot  مخرجات ProgressAggregator::snapshotForCourse
     */
    public function __construct(
        private readonly Course $course,
        private readonly array $snapshot,
    ) {
        parent::__construct($course);
    }

    public function toArray(Request $request): array
    {
        $states = $this->snapshot['lesson_states'] ?? [];

        return [
            'id' => $this->course->id,
            'slug' => $this->course->slug,
            'name' => $this->course->name,
            'description' => $this->course->description,
            'image' => $this->course->image,
            'icon' => $this->course->icon,
            'color' => $this->course->color,
            'subject' => [
                'id' => $this->course->subject->id,
                'slug' => $this->course->subject->slug,
                'name' => $this->course->subject->name,
            ],
            'progress' => $this->snapshot['progress'],
            'status' => $this->snapshot['status'],
            'completed_count' => $this->snapshot['completed_count'],
            'total_count' => $this->snapshot['total_count'],
            'last_lesson' => $this->lessonPreview($this->snapshot['last_lesson']),
            'next_lesson' => $this->lessonPreview($this->snapshot['next_lesson']),
            'last_visited_at' => $this->snapshot['last_visited_at']?->toIso8601String(),
            'lessons' => $this->course->lessons
                ->sortBy('sort_order')
                ->values()
                ->map(fn (Lesson $lesson) => [
                    ...$this->lessonPreview($lesson),
                    'completed' => $states[$lesson->id]['completed'] ?? false,
                    'started_at' => $states[$lesson->id]['started_at'] ?? null,
                ]),
        ];
    }

    private function lessonPreview(?Lesson $lesson): ?array
    {
        if ($lesson === null) {
            return null;
        }

        return [
            'id' => $lesson->id,
            'slug' => $lesson->slug,
            'title' => $lesson->title,
            'image' => $lesson->image,
            'color' => $lesson->color,
            'summary' => $lesson->summary,
            'blocks_count' => $lesson->blocks_count ?? 0,
            'learning_objectives' => $lesson->learning_objectives ?? [],
            'duration' => EstimatedDuration::fromBlockCount($lesson->blocks_count ?? 0),
        ];
    }
}

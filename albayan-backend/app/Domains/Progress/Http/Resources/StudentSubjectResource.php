<?php

namespace App\Domains\Progress\Http\Resources;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Models\Lesson;
use App\Support\EstimatedDuration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * صفحة المادة للطالب — غلاف المادة وتقدمها + مقرراتها بتقدم كل مقرر ودروسه.
 */
class StudentSubjectResource extends JsonResource
{
    /**
     * @param  array  $snapshot  مخرجات ProgressService::snapshotForSubject
     */
    public function __construct(
        private readonly Subject $subject,
        private readonly array $snapshot,
    ) {
        parent::__construct($subject);
    }

    public function toArray(Request $request): array
    {
        $completedLessonIds = $this->snapshot['completed_lesson_ids'] ?? [];

        return [
            'id' => $this->subject->id,
            'slug' => $this->subject->slug,
            'name' => $this->subject->name,
            'image' => $this->subject->image,
            'icon' => $this->subject->icon,
            'color' => $this->subject->color,
            'description' => $this->subject->relationLoaded('courses') && $this->subject->courses->isNotEmpty()
                ? $this->subject->courses->first()->description
                : ('محتوى '.$this->subject->name.' — المفاهيم الأساسية وتطبيقاتها.'),
            'units_count' => $this->subject->units_count ?? 0,
            'lessons_count' => $this->subject->lessons_count ?? 0,
            'grade' => [
                'key' => $this->subject->grade->key,
                'name' => $this->subject->grade->name,
            ],
            'semester' => [
                'key' => $this->subject->semester?->key,
                'name' => $this->subject->semester?->name,
            ],
            'progress' => $this->snapshot['progress'],
            'status' => $this->snapshot['status'],
            'completed_count' => $this->snapshot['completed_count'],
            'total_count' => $this->snapshot['total_count'],
            'completed_lesson_ids' => $completedLessonIds,
            'last_lesson' => $this->lessonPreview($this->snapshot['last_lesson'], $completedLessonIds),
            'next_lesson' => $this->lessonPreview($this->snapshot['next_lesson'], $completedLessonIds),
            'last_visited_at' => $this->snapshot['last_visited_at']?->toIso8601String(),
            'units' => $this->subject->courses
                ->sortBy('sort_order')
                ->values()
                ->map(fn (Course $course) => $this->unit($course, $completedLessonIds)),
        ];
    }

    private function unit(Course $course, array $completedLessonIds): array
    {
        $snapshot = $this->snapshot['courses'][$course->id] ?? [
            'completed_count' => 0,
            'total_count' => 0,
            'progress' => 0,
            'status' => 'not_started',
            'last_lesson' => null,
            'next_lesson' => null,
            'last_visited_at' => null,
        ];

        return [
            'id' => $course->id,
            'slug' => $course->slug,
            'name' => $course->name,
            'description' => $course->description,
            'image' => $course->image,
            'icon' => $course->icon,
            'color' => $course->color,
            'progress' => $snapshot['progress'],
            'status' => $snapshot['status'],
            'completed_count' => $snapshot['completed_count'],
            'total_count' => $snapshot['total_count'],
            'last_lesson' => $this->lessonPreview($snapshot['last_lesson']),
            'next_lesson' => $this->lessonPreview($snapshot['next_lesson']),
            'last_visited_at' => $snapshot['last_visited_at']?->toIso8601String(),
            'lessons' => $course->lessons
                ->sortBy('sort_order')
                ->values()
                ->map(fn (Lesson $lesson) => [
                    ...$this->lessonPreview($lesson),
                    'completed' => in_array($lesson->id, $completedLessonIds, true),
                ]),
        ];
    }

    private function lessonPreview(?Lesson $lesson, array $completedLessonIds = []): ?array
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
            'blocks_count' => $lesson->blocks_count ?? 0,
            'duration' => EstimatedDuration::fromBlockCount($lesson->blocks_count ?? 0),
            'completed' => in_array($lesson->id, $completedLessonIds, true),
        ];
    }
}

<?php

namespace App\Domains\Curriculum\Http\Resources\Public;

use App\Domains\Auth\Models\StudentProfile;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Progress\Services\ProgressAggregator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * بيانات صفحة بيت الطالب: سياقه الأكاديمي + أقسام تعلمه (مواد فصله)
 * مع تقدّمه في كل مادة والتقدّم الكلي.
 */
class StudentHomeResource extends JsonResource
{
    /**
     * @param  iterable  $subjects  مواد الفصل (محملة بالدروس المرتبة)
     * @param  array<int, array>  $snapshots  مخرجات ProgressAggregator::snapshotsForSubjects
     */
    public function __construct(
        private readonly StudentProfile $profile,
        private readonly iterable $subjects,
        private readonly array $snapshots,
    ) {
        parent::__construct($profile);
    }

    public function toArray(Request $request): array
    {
        $grade = $this->profile->grade;
        $semester = $this->profile->semester;

        return [
            'student' => [
                'name' => $this->profile->user->name,
            ],
            'grade' => [
                'key' => $grade->key,
                'name' => $grade->name,
                'image' => $grade->image,
                'icon' => $grade->icon,
            ],
            'semester' => [
                'key' => $semester->key,
                'name' => $semester->name,
            ],
            'academic_year' => '2026 / 2027',
            'overall_progress' => app(ProgressAggregator::class)->overall($this->snapshots),
            'subjects' => collect($this->subjects)->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'slug' => $subject->slug,
                'name' => $subject->name,
                'image' => $subject->image,
                'icon' => $subject->icon,
                'color' => $subject->color,
                'description' => $subject->relationLoaded('courses') && $subject->courses->isNotEmpty()
                    ? $subject->courses->first()->description
                    : ('محتوى '.$subject->name.' — المفاهيم الأساسية وتطبيقاتها.'),
                'units_count' => $subject->units_count ?? 0,
                'lessons_count' => $subject->lessons_count ?? 0,
                'grade_key' => $subject->grade->key,
                'semester_key' => $subject->semester->key,
                'progress' => $this->snapshots[$subject->id]['progress'] ?? 0,
                'status' => $this->snapshots[$subject->id]['status'] ?? 'not_started',
                'completed_count' => $this->snapshots[$subject->id]['completed_count'] ?? 0,
                'total_count' => $this->snapshots[$subject->id]['total_count'] ?? 0,
                'last_lesson' => $this->lessonPreview($this->snapshots[$subject->id]['last_lesson'] ?? null, $this->snapshots[$subject->id]['completed_lesson_ids'] ?? []),
                'next_lesson' => $this->lessonPreview($this->snapshots[$subject->id]['next_lesson'] ?? null, $this->snapshots[$subject->id]['completed_lesson_ids'] ?? []),
                'last_visited_at' => $this->snapshots[$subject->id]['last_visited_at']?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    private function lessonPreview(mixed $lesson, array $completedLessonIds = []): ?array
    {
        if ($lesson === null) {
            return null;
        }

        return [
            'id' => $lesson->id,
            'slug' => $lesson->slug,
            'title' => $lesson->title,
            'completed' => in_array($lesson->id, $completedLessonIds, true),
        ];
    }
}

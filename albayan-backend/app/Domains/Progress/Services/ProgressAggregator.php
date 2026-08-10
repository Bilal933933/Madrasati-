<?php

namespace App\Domains\Progress\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Progress\Enums\ProgressStatus;
use App\Domains\Progress\Models\LessonCompletion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * اشتقاق تقدّم الطالب (قراءات) — لقطات المواد والمقررات والتقدم الكلي
 * من سجلات lesson_completions (مصدر الحقيقة). لا يكتب أي بيانات؛
 * التسجيل مناطٌ بـ ProgressRecorder.
 */
class ProgressAggregator
{
    /**
     * خريطة تقدم لكل مادة مفاتيحها id المادة — بجلب سجلات المستخدم دفعة واحدة.
     *
     * تتوقع المواد محمّلةً بالعلاقة courses.lessons (المنشور والمرتب).
     *
     * @return array<int, array>
     */
    public function snapshotsForSubjects(User $user, Collection $subjects): array
    {
        $completions = LessonCompletion::query()
            ->forUser($user)
            ->get()
            ->keyBy('lesson_id');

        $result = [];

        foreach ($subjects as $subject) {
            $result[$subject->id] = $this->snapshot($this->orderedLessons($subject), $completions);
        }

        return $result;
    }

    /**
     * تقدم مادة واحدة مع تقدم كل مقرر فيها — لتغذية صفحة المادة.
     */
    public function snapshotForSubject(User $user, Subject $subject): array
    {
        $lessons = $this->orderedLessons($subject);
        $completions = $this->completionsForLessons($user, $lessons);

        return [
            ...$this->snapshot($lessons, $completions),
            'courses' => $this->coursesSnapshot($subject, $completions),
        ];
    }

    /**
     * تقدم مقرر واحد مع حالة كل درس فيه (مكتمل/مبدأ) — لتغذية صفحة المقرر.
     */
    public function snapshotForCourse(User $user, Course $course): array
    {
        $lessons = $course->lessons
            ->where('is_published', true)
            ->sortBy('sort_order')
            ->values()
            ->all();

        $completions = $this->completionsForLessons($user, $lessons);

        return [
            ...$this->snapshot($lessons, $completions),
            'lesson_states' => collect($lessons)->mapWithKeys(fn (Lesson $lesson) => [
                $lesson->id => [
                    'completed' => $completions->get($lesson->id)?->completed_at !== null,
                    'started_at' => $completions->get($lesson->id)?->started_at?->toIso8601String(),
                ],
            ])->all(),
        ];
    }

    /**
     * ملخص وحدة (مقرر) لدرسٍ وللمستخدم الحالي — يغذّي شاشة نهاية الدرس:
     * حالة إكمال الوحدة من تقدم حقيقي + الوحدة التالية في نفس المادة.
     *
     * @return array{
     *     course: array{id:int, name:string, slug:?string, image:?string, color:?string},
     *     completion: array{completed_count:int, total_count:int, progress:int, status:string, next_lesson: ?array},
     *     next_course: ?array
     * }
     */
    public function unitCompletionForLesson(User $user, Lesson $lesson): array
    {
        $course = $lesson->course;

        $snapshot = $this->snapshotForCourse($user, $course);

        return [
            'course' => [
                'id' => $course->id,
                'name' => $course->name,
                'slug' => $course->slug,
                'image' => $course->image,
                'color' => $course->color,
            ],
            'completion' => [
                'completed_count' => $snapshot['completed_count'],
                'total_count' => $snapshot['total_count'],
                'progress' => $snapshot['progress'],
                'status' => $snapshot['status'],
                'next_lesson' => $snapshot['next_lesson']
                    ? [
                        'id' => $snapshot['next_lesson']->id,
                        'slug' => $snapshot['next_lesson']->slug,
                        'title' => $snapshot['next_lesson']->title,
                    ]
                    : null,
            ],
            'next_course' => $this->nextCourse($course),
        ];
    }

    /**
     * الوحدة التالية المنشورة في نفس المادة (بعد وحدة الدرس الحالي) —
     * مع درسها الأول (start_slug) لتوجيه [ابدأ الوحدة التالية].
     *
     * @return array{id:int, name:string, slug:?string, start_slug:?string}|null
     */
    public function nextCourse(?Course $course): ?array
    {
        if ($course === null) {
            return null;
        }

        $next = Course::query()
            ->where('subject_id', $course->subject_id)
            ->where('is_published', true)
            ->where(function (Builder $q) use ($course) {
                $q->where('sort_order', '>', $course->sort_order)
                    ->orWhere(function (Builder $q2) use ($course) {
                        $q2->where('sort_order', $course->sort_order)
                            ->where('id', '>', $course->id);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->with(['lessons' => fn ($q) => $q
                ->where('is_published', true)
                ->orderBy('sort_order')])
            ->first();

        if ($next === null) {
            return null;
        }

        return [
            'id' => $next->id,
            'name' => $next->name,
            'slug' => $next->slug,
            'start_slug' => $next->lessons->first()?->slug,
        ];
    }

    /**
     * النسبة الكلية: متوسط نسب المواد (تُمرَّر خريطة snapshotsForSubjects).
     *
     * @param  array<int, array>  $snapshots
     */
    public function overall(array $snapshots): int
    {
        if ($snapshots === []) {
            return 0;
        }

        return (int) round(collect($snapshots)->avg('progress'));
    }

    /**
     * تقدم وحدة (مادة أو مقرر) من قائمته المرتبة بالدروس وسجلات الإكمال.
     *
     * @param  array<int, Lesson>  $lessons
     * @param  Collection<int, LessonCompletion>  $completions  مفاتيحها lesson_id
     * @return array{completed_count: int, total_count: int, completed_lesson_ids: array<int, int>, progress: int, status: string, last_lesson: ?Lesson, next_lesson: ?Lesson, last_visited_at: ?Carbon}
     */
    private function snapshot(array $lessons, Collection $completions): array
    {
        $lessonIds = collect($lessons)->pluck('id')->all();

        // سجلات هذه الوحدة فقط — لا تُحتسب إكمالات وحدات/مواد أخرى.
        $relevant = $completions->filter(
            fn (LessonCompletion $c) => in_array($c->lesson_id, $lessonIds, true),
        );

        $total = count($lessons);
        $completedRows = $relevant->filter(
            fn (LessonCompletion $c) => $c->completed_at !== null,
        );
        $completed = $completedRows->count();

        $status = match (true) {
            $relevant->isEmpty(), $total === 0 => ProgressStatus::NotStarted,
            $completed === $total => ProgressStatus::Completed,
            default => ProgressStatus::InProgress,
        };

        $byId = collect($lessons)->keyBy('id');
        $lastCompletion = $relevant
            ->sortByDesc(fn (LessonCompletion $c) => $c->completed_at ?? $c->started_at)
            ->first();

        $nextLesson = null;
        foreach ($lessons as $lesson) {
            $completion = $relevant->get($lesson->id);
            if ($completion === null || $completion->completed_at === null) {
                $nextLesson = $lesson;
                break;
            }
        }

        return [
            'completed_count' => $completed,
            'total_count' => $total,
            'completed_lesson_ids' => $completedRows->pluck('lesson_id')->all(),
            'progress' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
            'status' => $status->value,
            'last_lesson' => $lastCompletion ? $byId->get($lastCompletion->lesson_id) : null,
            'next_lesson' => $nextLesson,
            'last_visited_at' => $lastCompletion ? ($lastCompletion->completed_at ?? $lastCompletion->started_at) : null,
        ];
    }

    /**
     * سجلات إكمال مستخدم داخل قائمة دروس محددة، مفاتيحها lesson_id.
     *
     * @param  array<int, Lesson>  $lessons
     * @return Collection<int, LessonCompletion>
     */
    private function completionsForLessons(User $user, array $lessons): Collection
    {
        $ids = array_map(fn (Lesson $lesson) => $lesson->id, $lessons);

        if ($ids === []) {
            return new Collection;
        }

        return LessonCompletion::query()
            ->forUser($user)
            ->inLessons($ids)
            ->get()
            ->keyBy('lesson_id');
    }

    /**
     * دروس مادة مرتبةً (المقرر ثم الدرس) من العلاقات المحمّلة.
     *
     * @return array<int, Lesson>
     */
    private function orderedLessons(Subject $subject): array
    {
        return $subject->courses
            ->where('is_published', true)
            ->sortBy('sort_order')
            ->flatMap(fn (Course $course) => $course->lessons
                ->where('is_published', true)
                ->sortBy('sort_order')
                ->values())
            ->values()
            ->all();
    }

    /**
     * تقدم كل مقرر منشور في المادة — مفاتيحها id المقرر.
     *
     * @param  Collection<int, LessonCompletion>  $completions
     * @return array<int, array>
     */
    private function coursesSnapshot(Subject $subject, Collection $completions): array
    {
        $result = [];

        foreach ($subject->courses->sortBy('sort_order') as $course) {
            if (! $course->is_published) {
                continue;
            }

            $lessons = $course->lessons
                ->where('is_published', true)
                ->sortBy('sort_order')
                ->values()
                ->all();

            $result[$course->id] = $this->snapshot($lessons, $completions);
        }

        return $result;
    }
}

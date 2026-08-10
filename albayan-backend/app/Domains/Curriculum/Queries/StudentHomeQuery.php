<?php

namespace App\Domains\Curriculum\Queries;

use App\Domains\Auth\Models\StudentProfile;
use App\Domains\Curriculum\Models\Subject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * استعلامات صفحة بيت الطالب (Student Home) — طبقة قراءة فقط.
 *
 * ليست Business Rules؛ فقط تجمع مواد صف/فصل الطالب من ملفه الأكاديمي
 * مرتّبة بأولويته (آخر مادة مستكشفة أولًا ثم sort_order).
 */
class StudentHomeQuery
{
    /**
     * مواد الفصل الدراسي للطالب، مرتّبة بأولوية الطالب.
     *
     * تُحمَّل المقررات المنشورة بدروسها المرتبة — لتشتق منها خريطة تقدم الطالب
     * (التقدم، الحالة، آخر/قادم درس) عبر ProgressAggregator.
     *
     * @return Collection<int, Subject>
     */
    public function subjects(StudentProfile $profile, ?int $lastSubjectId): Collection
    {
        return Subject::query()
            ->where('semester_id', $profile->semester_id)
            ->where('is_published', true)
            ->with([
                'grade.stage',
                'semester',
                'courses' => fn ($q) => $q
                    ->where('is_published', true)
                    ->orderBy('sort_order')
                    ->with(['lessons' => fn ($q) => $q
                        ->where('is_published', true)
                        ->orderBy('sort_order')]),
            ])
            ->withCount([
                'courses as units_count' => fn (Builder $q) => $q->where('is_published', true),
                'lessons as lessons_count' => fn (Builder $q) => $q->where('lessons.is_published', true),
            ])
            ->get()
            ->sortBy(fn ($subject) => [
                $subject->id === $lastSubjectId ? 0 : 1,
                $subject->sort_order,
            ]);
    }
}

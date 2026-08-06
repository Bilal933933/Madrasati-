<?php

namespace App\Domains\Curriculum\Queries;

use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * طبقة قراءة (Read Model) للاستكشاف الهرمي للمنهج.
 *
 * ليست Business Rules ولا تعديلًا — فقط استعلامات جاهزة يستهلكها
 * ExploreController لعرض الشجرة (Stage ← Grade ← Semester ← Subject).
 * جميعها تعرض المنشور فقط.
 */
class ExploreQuery
{
    public function stages(): Collection
    {
        return Stage::query()
            ->where('is_published', true)
            ->withCount(['grades' => fn (Builder $q) => $q->where('is_published', true)])
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * صفوف مرحلة محددة بمفتاحها التقني (مثل primary).
     */
    public function grades(string $stageKey): Collection
    {
        Stage::query()
            ->where('is_published', true)
            ->where('key', $stageKey)
            ->firstOrFail();

        return Grade::query()
            ->where('is_published', true)
            ->whereHas('stage', fn (Builder $q) => $q
                ->where('key', $stageKey)
                ->where('is_published', true))
            ->withCount(['semesters' => fn (Builder $q) => $q->where('is_published', true)])
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * فصول صف محدد بمفتاحي المرحلة والصف (مثل primary + grade-5).
     */
    public function semesters(string $stageKey, string $gradeKey): Collection
    {
        return Semester::query()
            ->whereHas('grade', fn (Builder $q) => $q
                ->where('key', $gradeKey)
                ->where('is_published', true)
                ->whereHas('stage', fn (Builder $q2) => $q2
                    ->where('key', $stageKey)
                    ->where('is_published', true)))
            ->withCount(['subjects' => fn (Builder $q) => $q->where('is_published', true)])
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * مواد فصل محدد (بمفاتيح المرحلة والصف والفصل).
     */
    public function subjects(string $stageKey, string $gradeKey, string $semesterKey): Collection
    {
        return Subject::query()
            ->where('is_published', true)
            ->whereHas('semester', fn (Builder $q) => $q
                ->where('key', $semesterKey)
                ->whereHas('grade', fn (Builder $q2) => $q2
                    ->where('key', $gradeKey)
                    ->where('is_published', true)
                    ->whereHas('stage', fn (Builder $q3) => $q3
                        ->where('key', $stageKey)
                        ->where('is_published', true))))
            ->withCount([
                'courses as units_count' => fn (Builder $q) => $q->where('is_published', true),
                'lessons as lessons_count' => fn (Builder $q) => $q->where('lessons.is_published', true),
            ])
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * مادة بمعرّف slug — لدعم الدخول المباشر من أي مستوى (Deep Link).
     * تُحمَّل الوحدات (المقررات) ودروسها بعد الكتل لحساب المدة.
     */
    public function subject(string $slug): Subject
    {
        return Subject::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->with(['courses' => fn ($q) => $q
                ->where('is_published', true)
                ->orderBy('sort_order')
                ->with(['lessons' => fn ($q) => $q
                    ->where('is_published', true)
                    ->orderBy('sort_order')
                    ->withCount('blocks')])])
            ->firstOrFail();
    }
}

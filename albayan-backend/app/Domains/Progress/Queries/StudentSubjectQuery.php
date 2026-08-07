<?php

namespace App\Domains\Progress\Queries;

use App\Domains\Curriculum\Models\Subject;
use Illuminate\Database\Eloquent\Builder;

/**
 * قراءة صفحة المادة للطالب — نفس شجرة الاستكشاف مع تفصيل مقرراتها ودروسها
 * (المنشور والمرتب) لتغذية تقدم المقررات.
 */
class StudentSubjectQuery
{
    public function subject(string $slug): Subject
    {
        return Subject::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->with([
                'grade.stage',
                'semester',
                'courses' => fn ($q) => $q
                    ->where('is_published', true)
                    ->orderBy('sort_order')
                    ->with(['lessons' => fn ($q) => $q
                        ->where('is_published', true)
                        ->orderBy('sort_order')
                        ->withCount('blocks')]),
            ])
            ->withCount([
                'courses as units_count' => fn (Builder $q) => $q->where('is_published', true),
                'lessons as lessons_count' => fn (Builder $q) => $q->where('lessons.is_published', true),
            ])
            ->firstOrFail();
    }
}

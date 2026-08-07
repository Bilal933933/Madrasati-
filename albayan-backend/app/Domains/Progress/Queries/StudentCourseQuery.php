<?php

namespace App\Domains\Progress\Queries;

use App\Domains\Curriculum\Models\Course;

/**
 * قراءة صفحة المقرر للطالب — المقرر المنشور بدروسه (المنشورة والمرتبة)
 * مع عدد الأجزاء لكل درس لتغذية حالة التقدم والدروس.
 */
class StudentCourseQuery
{
    public function course(string $slug): Course
    {
        return Course::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->with([
                'subject.grade',
                'lessons' => fn ($q) => $q
                    ->where('is_published', true)
                    ->orderBy('sort_order')
                    ->withCount('blocks'),
            ])
            ->firstOrFail();
    }
}

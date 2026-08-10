<?php

namespace App\Domains\Progress\Http\Controllers;

use App\Domains\Progress\Http\Resources\StudentCourseResource;
use App\Domains\Progress\Queries\StudentCourseQuery;
use App\Domains\Progress\Services\ProgressAggregator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * صفحة المقرر للطالب — المقرر بدروسه + تقدمه وتقدم كل درس للمستخدم الحالي.
 */
class StudentCourseController extends Controller
{
    public function __construct(
        private readonly StudentCourseQuery $query,
        private readonly ProgressAggregator $progressAggregator,
    ) {}

    public function show(string $slug, Request $request)
    {
        $course = $this->query->course($slug);

        return new StudentCourseResource(
            $course,
            $this->progressAggregator->snapshotForCourse($request->user(), $course),
        );
    }
}

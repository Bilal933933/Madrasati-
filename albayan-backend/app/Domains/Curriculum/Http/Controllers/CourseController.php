<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\CourseResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class CourseController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return CourseResource::collection($this->curriculumService->publishedCourses());
    }

    public function show(string $slug)
    {
        return new CourseResource($this->curriculumService->findPublishedCourseBySlug($slug));
    }
}

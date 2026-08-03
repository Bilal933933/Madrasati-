<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\GradeResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class GradeController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return GradeResource::collection($this->curriculumService->publishedGrades());
    }

    public function show(string $slug)
    {
        return new GradeResource($this->curriculumService->findPublishedGradeBySlug($slug));
    }
}

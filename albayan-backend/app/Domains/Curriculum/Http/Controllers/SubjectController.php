<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\SubjectResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class SubjectController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return SubjectResource::collection($this->curriculumService->publishedSubjects());
    }

    public function show(string $slug)
    {
        return new SubjectResource($this->curriculumService->findPublishedSubjectBySlug($slug));
    }
}

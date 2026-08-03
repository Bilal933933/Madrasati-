<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\SectionResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class SectionController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return SectionResource::collection($this->curriculumService->publishedSections());
    }

    public function show(string $slug)
    {
        return new SectionResource($this->curriculumService->findPublishedSectionBySlug($slug));
    }
}

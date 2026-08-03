<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\StageResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class StageController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return StageResource::collection($this->curriculumService->publishedStages());
    }

    public function show(string $slug)
    {
        return new StageResource($this->curriculumService->findPublishedStageBySlug($slug));
    }
}

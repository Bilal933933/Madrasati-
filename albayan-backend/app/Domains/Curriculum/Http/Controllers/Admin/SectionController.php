<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\SectionRequest;
use App\Domains\Curriculum\Http\Resources\SectionResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

class SectionController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return SectionResource::collection($this->curriculumService->sections());
    }

    public function store(SectionRequest $request)
    {
        $section = $this->curriculumService->createSection($request->validated());

        return response()->json([
            'data' => new SectionResource($section),
            'message' => 'تم إنشاء الوحدة بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new SectionResource($this->curriculumService->findSection($id));
    }

    public function update(SectionRequest $request, int $id)
    {
        $section = $this->curriculumService->updateSection($id, $request->validated());

        return response()->json([
            'data' => new SectionResource($section),
            'message' => 'تم تحديث الوحدة بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->curriculumService->deleteSection($id);

        return response()->json([
            'message' => 'تم حذف الوحدة بنجاح.',
        ]);
    }
}

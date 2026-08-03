<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\StageRequest;
use App\Domains\Curriculum\Http\Resources\StageResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

class StageController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return StageResource::collection($this->curriculumService->stages());
    }

    public function store(StageRequest $request)
    {
        $stage = $this->curriculumService->createStage($request->validated());

        return response()->json([
            'data' => new StageResource($stage),
            'message' => 'تم إنشاء المرحلة بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new StageResource($this->curriculumService->findStage($id));
    }

    public function update(StageRequest $request, int $id)
    {
        $stage = $this->curriculumService->updateStage($id, $request->validated());

        return response()->json([
            'data' => new StageResource($stage),
            'message' => 'تم تحديث المرحلة بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->curriculumService->deleteStage($id);

        return response()->json([
            'message' => 'تم حذف المرحلة بنجاح.',
        ]);
    }
}

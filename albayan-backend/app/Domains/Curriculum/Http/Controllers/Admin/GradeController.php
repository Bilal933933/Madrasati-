<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\GradeRequest;
use App\Domains\Curriculum\Http\Resources\GradeResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

class GradeController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return GradeResource::collection($this->curriculumService->grades());
    }

    public function store(GradeRequest $request)
    {
        $grade = $this->curriculumService->createGrade($request->validated());

        return response()->json([
            'data' => new GradeResource($grade),
            'message' => 'تم إنشاء الصف بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new GradeResource($this->curriculumService->findGrade($id));
    }

    public function update(GradeRequest $request, int $id)
    {
        $grade = $this->curriculumService->updateGrade($id, $request->validated());

        return response()->json([
            'data' => new GradeResource($grade),
            'message' => 'تم تحديث الصف بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->curriculumService->deleteGrade($id);

        return response()->json([
            'message' => 'تم حذف الصف بنجاح.',
        ]);
    }
}

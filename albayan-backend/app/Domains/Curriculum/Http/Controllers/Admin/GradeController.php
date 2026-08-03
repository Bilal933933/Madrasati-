<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\GradeRequest;
use App\Domains\Curriculum\Http\Resources\GradeResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index(Request $request)
    {
        return GradeResource::collection(
            $this->curriculumService->grades($request->integer('stage_id'))
        );
    }

    public function nextOrder(Request $request)
    {
        return response()->json([
            'data' => ['next_order' => $this->curriculumService->nextGradeOrder($request->integer('stage_id'))],
        ]);
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

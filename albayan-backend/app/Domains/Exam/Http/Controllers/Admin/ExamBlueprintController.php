<?php

namespace App\Domains\Exam\Http\Controllers\Admin;

use App\Domains\Exam\Http\Requests\ExamBlueprintRequest;
use App\Domains\Exam\Http\Resources\ExamBlueprintResource;
use App\Domains\Exam\Services\ExamBlueprintService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamBlueprintController extends Controller
{
    public function __construct(private readonly ExamBlueprintService $examBlueprintService) {}

    public function index(Request $request)
    {
        return ExamBlueprintResource::collection(
            $this->examBlueprintService->blueprints(
                $request->string('exam_type')->toString() ?: null,
                $request->boolean('active_only'),
            )
        );
    }

    public function show(int $id)
    {
        return new ExamBlueprintResource($this->examBlueprintService->findBlueprint($id));
    }

    public function store(ExamBlueprintRequest $request)
    {
        $blueprint = $this->examBlueprintService->create($request->validated());

        return response()->json([
            'data' => new ExamBlueprintResource($blueprint),
            'message' => 'تم إنشاء تعريف الامتحان بنجاح.',
        ], 201);
    }

    public function update(ExamBlueprintRequest $request, int $id)
    {
        $blueprint = $this->examBlueprintService->update($id, $request->validated());

        return response()->json([
            'data' => new ExamBlueprintResource($blueprint),
            'message' => 'تم تحديث تعريف الامتحان بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->examBlueprintService->delete($id);

        return response()->json([
            'message' => 'تم حذف تعريف الامتحان بنجاح.',
        ]);
    }
}

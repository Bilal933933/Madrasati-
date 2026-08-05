<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\SubjectRequest;
use App\Domains\Curriculum\Http\Resources\SubjectResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index(Request $request)
    {
        return SubjectResource::collection(
            $this->curriculumService->subjects($request->integer('grade_id'), $request->integer('semester_id'))
        );
    }

    public function nextOrder(Request $request)
    {
        return response()->json([
            'data' => ['next_order' => $this->curriculumService->nextSubjectOrder($request->integer('grade_id'))],
        ]);
    }

    public function store(SubjectRequest $request)
    {
        $subject = $this->curriculumService->createSubject($request->validated());

        return response()->json([
            'data' => new SubjectResource($subject),
            'message' => 'تم إنشاء المادة بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new SubjectResource($this->curriculumService->findSubject($id));
    }

    public function update(SubjectRequest $request, int $id)
    {
        $subject = $this->curriculumService->updateSubject($id, $request->validated());

        return response()->json([
            'data' => new SubjectResource($subject),
            'message' => 'تم تحديث المادة بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->curriculumService->deleteSubject($id);

        return response()->json([
            'message' => 'تم حذف المادة بنجاح.',
        ]);
    }
}

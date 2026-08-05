<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\SemesterRequest;
use App\Domains\Curriculum\Http\Resources\SemesterResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "grade_id": 1,
     *       "name": "الفصل الدراسي الأول",
     *       "sort_order": 0,
     *       "children": []
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return SemesterResource::collection(
            $this->curriculumService->semesters($request->integer('grade_id'))
        );
    }

    /**
     * @response {
     *   "data": {
     *     "next_order": 1
     *   }
     * }
     */
    public function nextOrder(Request $request)
    {
        return response()->json([
            'data' => ['next_order' => $this->curriculumService->nextSemesterOrder($request->integer('grade_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "grade_id": 1,
     *     "name": "الفصل الدراسي الأول",
     *     "sort_order": 0,
     *     "children": []
     *   },
     *   "message": "تم إنشاء الفصل الدراسي بنجاح."
     * }
     */
    public function store(SemesterRequest $request)
    {
        $semester = $this->curriculumService->createSemester($request->validated());

        return response()->json([
            'data' => new SemesterResource($semester),
            'message' => 'تم إنشاء الفصل الدراسي بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "grade_id": 1,
     *     "name": "الفصل الدراسي الأول",
     *     "sort_order": 0,
     *     "children": []
     *   }
     * }
     */
    public function show(int $id)
    {
        return new SemesterResource($this->curriculumService->findSemester($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "grade_id": 1,
     *     "name": "الفصل الدراسي الأول",
     *     "sort_order": 0,
     *     "children": []
     *   },
     *   "message": "تم تحديث الفصل الدراسي بنجاح."
     * }
     */
    public function update(SemesterRequest $request, int $id)
    {
        $semester = $this->curriculumService->updateSemester($id, $request->validated());

        return response()->json([
            'data' => new SemesterResource($semester),
            'message' => 'تم تحديث الفصل الدراسي بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف الفصل الدراسي بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->curriculumService->deleteSemester($id);

        return response()->json([
            'message' => 'تم حذف الفصل الدراسي بنجاح.',
        ]);
    }
}

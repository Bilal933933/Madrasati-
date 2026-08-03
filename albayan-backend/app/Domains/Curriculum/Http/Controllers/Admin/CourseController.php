<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\CourseRequest;
use App\Domains\Curriculum\Http\Resources\CourseResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;

class CourseController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index()
    {
        return CourseResource::collection($this->curriculumService->courses());
    }

    public function store(CourseRequest $request)
    {
        $course = $this->curriculumService->createCourse($request->validated());

        return response()->json([
            'data' => new CourseResource($course),
            'message' => 'تم إنشاء المقرر بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new CourseResource($this->curriculumService->findCourse($id));
    }

    public function update(CourseRequest $request, int $id)
    {
        $course = $this->curriculumService->updateCourse($id, $request->validated());

        return response()->json([
            'data' => new CourseResource($course),
            'message' => 'تم تحديث المقرر بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->curriculumService->deleteCourse($id);

        return response()->json([
            'message' => 'تم حذف المقرر بنجاح.',
        ]);
    }
}

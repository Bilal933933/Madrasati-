<?php

namespace App\Domains\Lesson\Http\Controllers\Admin;

use App\Domains\Lesson\Http\Requests\LessonRequest;
use App\Domains\Lesson\Http\Resources\LessonResource;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function __construct(private readonly LessonService $lessonService) {}

    public function index(Request $request)
    {
        return LessonResource::collection(
            $this->lessonService->lessons($request->integer('course_id'))
        );
    }

    public function nextOrder(Request $request)
    {
        return response()->json([
            'data' => ['next_order' => $this->lessonService->nextLessonOrder($request->integer('course_id'))],
        ]);
    }

    public function store(LessonRequest $request)
    {
        $lesson = $this->lessonService->createLesson($request->validated());

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'تم إنشاء الدرس بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new LessonResource($this->lessonService->findLesson($id));
    }

    public function update(LessonRequest $request, int $id)
    {
        $lesson = $this->lessonService->updateLesson($id, $request->validated());

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'تم تحديث الدرس بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->lessonService->deleteLesson($id);

        return response()->json([
            'message' => 'تم حذف الدرس بنجاح.',
        ]);
    }
}

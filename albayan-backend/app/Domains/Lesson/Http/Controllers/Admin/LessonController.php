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

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "course_id": 1,
     *       "title": "الدرس الأول",
     *       "slug": "lesson-slug",
     *       "summary": "ملخص الدرس",
     *       "image": "lessons/1.jpg",
     *       "video": "https://www.youtube.com/watch?v=abc123",
     *       "video_embed": "https://www.youtube.com/embed/abc123",
     *       "icon": "play",
     *       "color": "#10b981",
     *       "sort_order": 1,
     *       "is_published": true,
     *       "children": [
     *         {
     *           "id": 1,
     *           "lesson_id": 1,
     *           "title": "فقرة",
     *           "type": "text",
     *           "slug": "paragraph-slug",
     *           "image": null,
     *           "video": null,
     *           "video_embed": null,
     *           "icon": null,
     *           "color": null,
     *           "content": "<p>نص</p>",
     *           "sort_order": 1
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return LessonResource::collection(
            $this->lessonService->lessons($request->integer('course_id'))
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
            'data' => ['next_order' => $this->lessonService->nextLessonOrder($request->integer('course_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "course_id": 1,
     *     "title": "الدرس الأول",
     *     "slug": "lesson-slug",
     *     "summary": "ملخص الدرس",
     *     "image": "lessons/1.jpg",
     *     "video": "https://www.youtube.com/watch?v=abc123",
     *     "video_embed": "https://www.youtube.com/embed/abc123",
     *     "icon": "play",
     *     "color": "#10b981",
     *     "sort_order": 1,
     *     "is_published": true,
     *     "children": []
     *   },
     *   "message": "تم إنشاء الدرس بنجاح."
     * }
     */
    public function store(LessonRequest $request)
    {
        $lesson = $this->lessonService->createLesson($request->validated());

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'تم إنشاء الدرس بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "course_id": 1,
     *     "title": "الدرس الأول",
     *     "slug": "lesson-slug",
     *     "summary": "ملخص الدرس",
     *     "image": "lessons/1.jpg",
     *     "video": "https://www.youtube.com/watch?v=abc123",
     *     "video_embed": "https://www.youtube.com/embed/abc123",
     *     "icon": "play",
     *     "color": "#10b981",
     *     "sort_order": 1,
     *     "is_published": true,
     *     "children": []
     *   }
     * }
     */
    public function show(int $id)
    {
        return new LessonResource($this->lessonService->findLesson($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "course_id": 1,
     *     "title": "الدرس الأول",
     *     "slug": "lesson-slug",
     *     "summary": "ملخص الدرس",
     *     "image": "lessons/1.jpg",
     *     "video": "https://www.youtube.com/watch?v=abc123",
     *     "video_embed": "https://www.youtube.com/embed/abc123",
     *     "icon": "play",
     *     "color": "#10b981",
     *     "sort_order": 1,
     *     "is_published": true,
     *     "children": []
     *   },
     *   "message": "تم تحديث الدرس بنجاح."
     * }
     */
    public function update(LessonRequest $request, int $id)
    {
        $lesson = $this->lessonService->updateLesson($id, $request->validated());

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'تم تحديث الدرس بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف الدرس بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->lessonService->deleteLesson($id);

        return response()->json([
            'message' => 'تم حذف الدرس بنجاح.',
        ]);
    }
}

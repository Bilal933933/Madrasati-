<?php

namespace App\Domains\Curriculum\Http\Controllers\Admin;

use App\Domains\Curriculum\Http\Requests\CourseRequest;
use App\Domains\Curriculum\Http\Resources\CourseResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "subject_id": 1,
     *       "name": "مقرر الرياضيات",
     *       "slug": "math-course",
     *       "description": "وصف المقرر",
     *       "image": "courses/1.jpg",
     *       "icon": "book-open",
     *       "color": "#3b82f6",
     *       "sort_order": 1,
     *       "is_published": true,
     *       "children": [
     *         {
     *           "id": 1,
     *           "course_id": 1,
     *           "title": "درس",
     *           "slug": "lesson-slug",
     *           "summary": "ملخص",
     *           "image": "lessons/1.jpg",
     *           "video": "https://www.youtube.com/watch?v=abc123",
     *           "video_embed": "https://www.youtube.com/embed/abc123",
     *           "icon": "play",
     *           "color": "#10b981",
     *           "sort_order": 1,
     *           "is_published": true,
     *           "children": []
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return CourseResource::collection(
            $this->curriculumService->courses(
                $request->only(['stage_id', 'grade_id', 'semester_id', 'subject_id']),
                $request->integer('per_page', 20)
            )
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
            'data' => ['next_order' => $this->curriculumService->nextCourseOrder($request->integer('subject_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "subject_id": 1,
     *     "name": "مقرر الرياضيات",
     *     "slug": "math-course",
     *     "description": "وصف المقرر",
     *     "image": "courses/1.jpg",
     *     "icon": "book-open",
     *     "color": "#3b82f6",
     *     "sort_order": 1,
     *     "is_published": true,
     *     "children": []
     *   },
     *   "message": "تم إنشاء المقرر بنجاح."
     * }
     */
    public function store(CourseRequest $request)
    {
        $course = $this->curriculumService->createCourse($request->validated());

        return response()->json([
            'data' => new CourseResource($course),
            'message' => 'تم إنشاء المقرر بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "subject_id": 1,
     *     "name": "مقرر الرياضيات",
     *     "slug": "math-course",
     *     "description": "وصف المقرر",
     *     "image": "courses/1.jpg",
     *     "icon": "book-open",
     *     "color": "#3b82f6",
     *     "sort_order": 1,
     *     "is_published": true,
     *     "children": []
     *   }
     * }
     */
    public function show(int $id)
    {
        return new CourseResource($this->curriculumService->findCourse($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "subject_id": 1,
     *     "name": "مقرر الرياضيات",
     *     "slug": "math-course",
     *     "description": "وصف المقرر",
     *     "image": "courses/1.jpg",
     *     "icon": "book-open",
     *     "color": "#3b82f6",
     *     "sort_order": 1,
     *     "is_published": true,
     *     "children": []
     *   },
     *   "message": "تم تحديث المقرر بنجاح."
     * }
     */
    public function update(CourseRequest $request, int $id)
    {
        $course = $this->curriculumService->updateCourse($id, $request->validated());

        return response()->json([
            'data' => new CourseResource($course),
            'message' => 'تم تحديث المقرر بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف المقرر بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->curriculumService->deleteCourse($id);

        return response()->json([
            'message' => 'تم حذف المقرر بنجاح.',
        ]);
    }
}

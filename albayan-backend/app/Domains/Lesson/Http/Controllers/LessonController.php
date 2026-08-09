<?php

namespace App\Domains\Lesson\Http\Controllers;

use App\Domains\Exam\Services\ExamBlueprintService;
use App\Domains\Lesson\Http\Resources\LessonFlowResource;
use App\Domains\Lesson\Http\Resources\LessonPreviewResource;
use App\Domains\Lesson\Http\Resources\LessonResource;
use App\Domains\Lesson\Services\LessonFlowService;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class LessonController extends Controller
{
    public function __construct(
        private readonly LessonService $lessonService,
        private readonly LessonFlowService $lessonFlowService,
        private readonly ExamBlueprintService $examBlueprintService,
    ) {}

    public function index()
    {
        return LessonResource::collection($this->lessonService->publishedLessons());
    }

    public function show(string $slug)
    {
        $lesson = $this->lessonService->findPublishedLessonBySlug($slug);

        // بيانات شاشة النهاية: الدرس التالي في المقرر + امتحان الدرس (إن وُجد).
        $lesson->setAttribute('next_lesson', $this->lessonService->nextPublishedLesson($lesson));
        $lesson->setAttribute('lesson_exam', $this->examBlueprintService->activeLessonExam($lesson->id));

        return new LessonFlowResource($this->lessonFlowService->flow($lesson));
    }

    /**
     * معاينة تعريفية للدرس (بلا محتوى الكتل) — للاستكشاف والبحث وغيرهما.
     */
    public function preview(string $slug)
    {
        $lesson = $this->lessonService->findPublishedLessonBySlug($slug)->load([
            'course.subject',
            'blocks' => fn ($q) => $q->orderBy('sort_order')->orderBy('id'),
        ]);

        return new LessonPreviewResource($lesson);
    }
}

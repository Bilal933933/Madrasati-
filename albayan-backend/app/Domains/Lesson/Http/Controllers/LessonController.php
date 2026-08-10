<?php

namespace App\Domains\Lesson\Http\Controllers;

use App\Domains\Exam\Services\ExamBlueprintService;
use App\Domains\Lesson\Http\Resources\LessonFlowResource;
use App\Domains\Lesson\Http\Resources\LessonPreviewResource;
use App\Domains\Lesson\Http\Resources\LessonResource;
use App\Domains\Lesson\Services\LessonFlowService;
use App\Domains\Lesson\Services\LessonService;
use App\Domains\Progress\Services\ProgressAggregator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class LessonController extends Controller
{
    public function __construct(
        private readonly LessonService $lessonService,
        private readonly LessonFlowService $lessonFlowService,
        private readonly ExamBlueprintService $examBlueprintService,
        private readonly ProgressAggregator $progressAggregator,
    ) {}

    public function index()
    {
        return LessonResource::collection($this->lessonService->publishedLessons());
    }

    public function show(string $slug, Request $request)
    {
        $lesson = $this->lessonFlowService->flow(
            $this->lessonService->findPublishedLessonBySlug($slug),
        );

        // بيانات شاشة النهاية: الدرس التالي في المقرر + امتحان الدرس (إن وُجد).
        $lesson->setAttribute('next_lesson', $this->lessonService->nextPublishedLesson($lesson));
        $lesson->setAttribute('lesson_exam', $this->examBlueprintService->activeLessonExam($lesson->id));

        // ملخص الوحدة من تقدم المستخدم الحالي — يغذّي شاشة نهاية الوحدة (5.6).
        $lesson->setAttribute('flow_unit', $this->progressAggregator->unitCompletionForLesson(
            $request->user(),
            $lesson,
        ));

        return new LessonFlowResource($lesson);
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

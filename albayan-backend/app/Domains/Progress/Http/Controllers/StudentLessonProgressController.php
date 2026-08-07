<?php

namespace App\Domains\Progress\Http\Controllers;

use App\Domains\Lesson\Services\LessonService;
use App\Domains\Progress\Services\ProgressService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * تسجيل تقدّم الطالب في الدروس — نقاط بدء/إكمال صريحة تستهلكها الواجهة.
 */
class StudentLessonProgressController extends Controller
{
    public function __construct(
        private readonly LessonService $lessonService,
        private readonly ProgressService $progressService,
    ) {}

    public function start(string $slug, Request $request): JsonResponse
    {
        $this->progressService->markStarted(
            $request->user(),
            $this->lessonService->findPublishedLessonBySlug($slug),
        );

        return response()->json(['message' => 'تم تسجيل بدء الدرس.']);
    }

    public function complete(string $slug, Request $request): JsonResponse
    {
        $this->progressService->markCompleted(
            $request->user(),
            $this->lessonService->findPublishedLessonBySlug($slug),
        );

        return response()->json(['message' => 'تم تسجيل إكمال الدرس.']);
    }
}

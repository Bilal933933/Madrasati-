<?php

namespace App\Domains\Lesson\Http\Controllers;

use App\Domains\Lesson\Http\Resources\LessonResource;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد المنشور فقط (للطالب).
 */
class LessonController extends Controller
{
    public function __construct(private readonly LessonService $lessonService) {}

    public function index()
    {
        return LessonResource::collection($this->lessonService->publishedLessons());
    }

    public function show(string $slug)
    {
        return new LessonResource($this->lessonService->findPublishedLessonBySlug($slug));
    }
}

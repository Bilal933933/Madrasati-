<?php

namespace App\Domains\Lesson\Http\Controllers;

use App\Domains\Lesson\Http\Resources\ParagraphResource;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد الفقرات التابعة لدروس منشورة فقط.
 */
class ParagraphController extends Controller
{
    public function __construct(private readonly LessonService $lessonService) {}

    public function index()
    {
        return ParagraphResource::collection($this->lessonService->publishedParagraphs());
    }

    public function show(string $slug)
    {
        return new ParagraphResource($this->lessonService->findPublishedParagraphBySlug($slug));
    }
}

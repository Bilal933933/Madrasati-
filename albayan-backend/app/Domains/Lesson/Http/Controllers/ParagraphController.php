<?php

namespace App\Domains\Lesson\Http\Controllers;

use App\Domains\Lesson\Http\Resources\ParagraphResource;
use App\Domains\Lesson\Services\ParagraphService;
use App\Http\Controllers\Controller;

/**
 * عرض عام — يعيد الفقرات التابعة لدروس منشورة فقط.
 */
class ParagraphController extends Controller
{
    public function __construct(private readonly ParagraphService $paragraphService) {}

    public function index()
    {
        return ParagraphResource::collection($this->paragraphService->publishedParagraphs());
    }

    public function show(string $slug)
    {
        return new ParagraphResource($this->paragraphService->findPublishedParagraphBySlug($slug));
    }
}

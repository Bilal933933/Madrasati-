<?php

namespace App\Domains\Lesson\Http\Controllers\Admin;

use App\Domains\Lesson\Http\Requests\ParagraphRequest;
use App\Domains\Lesson\Http\Resources\ParagraphResource;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;

class ParagraphController extends Controller
{
    public function __construct(private readonly LessonService $lessonService) {}

    public function index()
    {
        return ParagraphResource::collection($this->lessonService->paragraphs());
    }

    public function store(ParagraphRequest $request)
    {
        $paragraph = $this->lessonService->createParagraph($request->validated());

        return response()->json([
            'data' => new ParagraphResource($paragraph),
            'message' => 'تم إنشاء الفقرة بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new ParagraphResource($this->lessonService->findParagraph($id));
    }

    public function update(ParagraphRequest $request, int $id)
    {
        $paragraph = $this->lessonService->updateParagraph($id, $request->validated());

        return response()->json([
            'data' => new ParagraphResource($paragraph),
            'message' => 'تم تحديث الفقرة بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->lessonService->deleteParagraph($id);

        return response()->json([
            'message' => 'تم حذف الفقرة بنجاح.',
        ]);
    }
}

<?php

namespace App\Domains\Lesson\Http\Controllers\Admin;

use App\Domains\Lesson\Http\Requests\ParagraphRequest;
use App\Domains\Lesson\Http\Resources\ParagraphResource;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ParagraphController extends Controller
{
    public function __construct(private readonly LessonService $lessonService) {}

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "lesson_id": 1,
     *       "title": "فقرة",
     *       "type": "text",
     *       "slug": "paragraph-slug",
     *       "image": null,
     *       "video": null,
     *       "video_embed": null,
     *       "icon": null,
     *       "color": null,
     *       "content": "<p>نص</p>",
     *       "sort_order": 1
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return ParagraphResource::collection(
            $this->lessonService->paragraphs($request->integer('lesson_id'))
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
            'data' => ['next_order' => $this->lessonService->nextParagraphOrder($request->integer('lesson_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "lesson_id": 1,
     *     "title": "فقرة",
     *     "type": "text",
     *     "slug": "paragraph-slug",
     *     "image": null,
     *     "video": null,
     *     "video_embed": null,
     *     "icon": null,
     *     "color": null,
     *     "content": "<p>نص</p>",
     *     "sort_order": 1
     *   },
     *   "message": "تم إنشاء الفقرة بنجاح."
     * }
     */
    public function store(ParagraphRequest $request)
    {
        $paragraph = $this->lessonService->createParagraph($request->validated());

        return response()->json([
            'data' => new ParagraphResource($paragraph),
            'message' => 'تم إنشاء الفقرة بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "lesson_id": 1,
     *     "title": "فقرة",
     *     "type": "text",
     *     "slug": "paragraph-slug",
     *     "image": null,
     *     "video": null,
     *     "video_embed": null,
     *     "icon": null,
     *     "color": null,
     *     "content": "<p>نص</p>",
     *     "sort_order": 1
     *   }
     * }
     */
    public function show(int $id)
    {
        return new ParagraphResource($this->lessonService->findParagraph($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "lesson_id": 1,
     *     "title": "فقرة",
     *     "type": "text",
     *     "slug": "paragraph-slug",
     *     "image": null,
     *     "video": null,
     *     "video_embed": null,
     *     "icon": null,
     *     "color": null,
     *     "content": "<p>نص</p>",
     *     "sort_order": 1
     *   },
     *   "message": "تم تحديث الفقرة بنجاح."
     * }
     */
    public function update(ParagraphRequest $request, int $id)
    {
        $paragraph = $this->lessonService->updateParagraph($id, $request->validated());

        return response()->json([
            'data' => new ParagraphResource($paragraph),
            'message' => 'تم تحديث الفقرة بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف الفقرة بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->lessonService->deleteParagraph($id);

        return response()->json([
            'message' => 'تم حذف الفقرة بنجاح.',
        ]);
    }
}

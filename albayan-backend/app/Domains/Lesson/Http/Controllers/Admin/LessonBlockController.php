<?php

namespace App\Domains\Lesson\Http\Controllers\Admin;

use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Http\Requests\ReorderLessonBlocksRequest;
use App\Domains\Lesson\Http\Requests\StoreLessonBlockRequest;
use App\Domains\Lesson\Http\Requests\UpdateLessonBlockRequest;
use App\Domains\Lesson\Http\Resources\LessonFlowResource;
use App\Domains\Lesson\Models\LessonBlock;
use App\Domains\Lesson\Services\LessonEditorService;
use App\Domains\Lesson\Services\LessonFlowService;
use App\Domains\Lesson\Services\LessonService;
use App\Http\Controllers\Controller;

/**
 * إدارة كتل رحلة الدرس (محرر الأدمن).
 * كل عمليات الكتابة هنا تُغيّر طبقة الترتيب فقط؛ محتوى الفقرات والتقييمات
 * يبقى في Service الخاصة بها.
 */
class LessonBlockController extends Controller
{
    public function __construct(
        private readonly LessonService $lessonService,
        private readonly LessonFlowService $lessonFlowService,
        private readonly LessonEditorService $lessonEditorService,
    ) {}

    /**
     * يعيد رحلة الدرس كاملةً مرتبةً بمحتواها — ما يستهلكه المحرر.
     */
    public function index(int $lesson)
    {
        $lessonModel = $this->lessonService->findLesson($lesson);

        return new LessonFlowResource($this->lessonFlowService->flow($lessonModel));
    }

    /**
     * إضافة عنصر جديد للرحلة (فقرة/تقييم/فيديو شامل).
     */
    public function store(StoreLessonBlockRequest $request, int $lesson)
    {
        $validated = $request->validated();
        $kind = BlockKind::from($validated['block_kind']);

        $this->lessonEditorService->add($lesson, $kind, $validated);

        return response()->json([
            'data' => new LessonFlowResource($this->lessonFlowService->flow($this->lessonService->findLesson($lesson))),
            'message' => 'تمت إضافة العنصر إلى الرحلة.',
        ], 201);
    }

    /**
     * إعادة ترتيب الكتل حسب تسلسل المُعرّفات.
     */
    public function reorder(ReorderLessonBlocksRequest $request, int $lesson)
    {
        $this->lessonEditorService->reorder($lesson, $request->validated()['ids']);

        return response()->json(['message' => 'تم تحديث ترتيب العناصر.']);
    }

    /**
     * إظهار/إخفاء عنصر داخل رحلة الطالب.
     */
    public function update(UpdateLessonBlockRequest $request, LessonBlock $lessonBlock)
    {
        $block = $this->lessonEditorService->toggleVisibility($lessonBlock->id);

        return response()->json([
            'data' => ['id' => $block->id, 'is_published' => $block->is_published],
            'message' => $block->is_published ? 'أصبح العنصر ظاهرًا للطالب.' : 'أُخفي العنصر عن الطالب.',
        ]);
    }

    /**
     * حذف عنصر من الرحلة (لا يحذف الفقرة/التقييم نفسها).
     */
    public function destroy(LessonBlock $lessonBlock)
    {
        $this->lessonEditorService->removeBlock($lessonBlock->id);

        return response()->json(['message' => 'تم حذف العنصر من الرحلة.']);
    }
}

<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\LessonBlock;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * طبقة منخفضة المستوى لإدارة صفوف lesson_blocks (إنشاء/حذف/ترتيب/إظهار وإخفاء).
 *
 * لا يعرف الفقرات والتقييمات؛ يُستخدم من LessonEditorService و LessonTemplateBuilder.
 */
class LessonBlockService
{
    public function blocks(?int $lessonId = null): Collection
    {
        return LessonBlock::query()
            ->when($lessonId, fn ($q) => $q->where('lesson_id', $lessonId))
            ->with(['paragraph', 'assessment.questions.options'])
            ->orderBy('sort_order')
            ->get();
    }

    public function nextOrder(int $lessonId): int
    {
        return (LessonBlock::query()->where('lesson_id', $lessonId)->max('sort_order') ?? 0) + 1;
    }

    /**
     * إنشاء صف كتلة يربط الرحلة بمحتوى (فقرة أو تقييم) أو بفيديو شامل.
     */
    public function createBlock(
        int $lessonId,
        BlockKind $kind,
        ?int $paragraphId = null,
        ?int $assessmentId = null,
    ): LessonBlock {
        if ($kind->isParagraph() && $paragraphId === null) {
            throw new InvalidArgumentException('كتلة الفقرة تتطلب paragraph_id.');
        }
        if ($kind->isAssessment() && $assessmentId === null) {
            throw new InvalidArgumentException('كتلة التقييم تتطلب assessment_id.');
        }

        return LessonBlock::create([
            'lesson_id' => $lessonId,
            'block_kind' => $kind->value,
            'paragraph_id' => $paragraphId,
            'assessment_id' => $assessmentId,
            'sort_order' => $this->nextOrder($lessonId),
        ]);
    }

    /**
     * إعادة ترتيب الكتل وفق تسلسل المُعرّفات المُمرَّر.
     *
     * @param  array<int, int>  $ids  ترتيب الكتل حسب الموضع النهائي.
     */
    public function updateOrder(int $lessonId, array $ids): void
    {
        DB::transaction(function () use ($lessonId, $ids) {
            $position = 0;
            foreach ($ids as $id) {
                LessonBlock::where('lesson_id', $lessonId)
                    ->where('id', $id)
                    ->update(['sort_order' => $position++]);
            }
        });
    }

    public function toggleVisibility(int $id): LessonBlock
    {
        $block = LessonBlock::findOrFail($id);
        $block->update(['is_published' => ! $block->is_published]);

        return $block;
    }

    public function deleteBlock(int $id): void
    {
        LessonBlock::findOrFail($id)->delete();
    }

    public function findBlock(int $id): LessonBlock
    {
        return LessonBlock::with(['paragraph', 'assessment.questions.options'])->findOrFail($id);
    }
}

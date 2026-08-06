<?php

namespace App\Support;

use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\LessonBlock;
use Illuminate\Database\Eloquent\Collection;

/**
 * تقدير المدة الزمنية للدرس ديناميكيًا — بلا عمود في قاعدة البيانات.
 *
 * تُشتق المدة من كتل رحلة الدرس: كل فقرة ≈ 4 دقائق، فيديو ≈ 6 دقائق،
 * تقييم ≈ دقيقتان. عند عدم توفر الكتل يُستخدم عددها الكلي كمضاعف.
 */
final class EstimatedDuration
{
    public static function fromBlockCount(int $blocks): int
    {
        return max(1, $blocks * 4);
    }

    /**
     * @param  Collection<int, LessonBlock>  $blocks
     */
    public static function fromBlocks(Collection $blocks): int
    {
        $total = $blocks->sum(fn (LessonBlock $block) => match ($block->block_kind) {
            BlockKind::LessonVideo->value => 6,
            BlockKind::Paragraph->value => 4,
            default => 2,
        });

        return max(1, $total);
    }
}

<?php

namespace App\Domains\Lesson\Http\Resources;

use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\LessonBlock;
use App\Support\EstimatedDuration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * معاينة الدرس (Lesson Preview) — نظرة تعريفية قبل البدء.
 *
 * تعرض بيانات وصفية فقط (لا محتوى كتل الدرس): المدة المقدرة، عدد الكتل،
 * عدد التقييمات، الأهداف — تُستهلك من الاستكشاف والبحث ولوحات التحكم.
 */
class LessonPreviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Lesson $lesson */
        $lesson = $this->resource;

        $blocks = $lesson->blocks;

        return [
            'id' => $lesson->id,
            'slug' => $lesson->slug,
            'title' => $lesson->title,
            'image' => $lesson->image,
            'subject' => $lesson->course?->subject?->name,
            'unit' => $lesson->course?->name,
            'description' => $lesson->summary,
            'learning_objectives' => $lesson->learning_objectives ?? [],
            'blocks_count' => $blocks->count(),
            'assessment_count' => $blocks->filter(fn (LessonBlock $block) => BlockKind::tryFrom($block->block_kind)?->isAssessment() ?? false)->count(),
            'duration' => EstimatedDuration::fromBlocks($blocks),
        ];
    }
}

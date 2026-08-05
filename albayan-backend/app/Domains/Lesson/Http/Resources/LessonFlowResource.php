<?php

namespace App\Domains\Lesson\Http\Resources;

use App\Domains\Assessment\Http\Resources\AssessmentResource;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\LessonBlock;
use App\Support\YouTubeUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * رحلة تعلم الدرس — تُرسم بترتيب الكتل، ويستهلكها الأدمن والطالب معًا.
 */
class LessonFlowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Lesson $lesson */
        $lesson = $this->resource;

        return [
            'lesson' => new LessonResource($lesson),
            'blocks' => $lesson->blocks
                ->map(fn (LessonBlock $block) => [
                    'id' => $block->id,
                    'kind' => $block->block_kind,
                    'sort_order' => $block->sort_order,
                    'is_published' => $block->is_published,
                    'data' => $this->blockData($lesson, $block),
                ])
                ->values(),
        ];
    }

    private function blockData($lesson, LessonBlock $block): mixed
    {
        return match ($block->block_kind) {
            BlockKind::Paragraph->value => $block->paragraph
                ? new ParagraphResource($block->paragraph)
                : null,

            BlockKind::PreAssessment->value,
            BlockKind::FormativeAssessment->value,
            BlockKind::FinalAssessment->value => $block->assessment
                ? new AssessmentResource($block->assessment)
                : null,

            BlockKind::LessonVideo->value => [
                'video' => $lesson->video,
                'video_embed' => YouTubeUrl::embed($lesson->video),
            ],

            default => null,
        };
    }
}

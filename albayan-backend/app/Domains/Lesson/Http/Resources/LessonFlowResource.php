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

        // تدفق الدرس رحلة تعلم: تُكشف الإجابات الصحيحة للطالب للتغذية الفورية
        // (يبقى الحجب ساريًا في مسارات القياس الرسمية الأخرى).
        $request->attributes->set('lesson_flow', true);

        return [
            'lesson' => new LessonResource($lesson),
            'next_lesson' => $lesson->next_lesson
                ? [
                    'id' => $lesson->next_lesson->id,
                    'slug' => $lesson->next_lesson->slug,
                    'title' => $lesson->next_lesson->title,
                    'summary' => $lesson->next_lesson->summary,
                ]
                : null,
            'lesson_exam' => $lesson->lesson_exam
                ? [
                    'id' => $lesson->lesson_exam->id,
                    'title' => $lesson->lesson_exam->title,
                ]
                : null,
            'unit' => $lesson->flow_unit ?? null,
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

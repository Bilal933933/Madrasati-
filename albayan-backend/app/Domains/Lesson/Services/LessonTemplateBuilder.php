<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;

/**
 * نقطة الإنشاء الموحدة للدرس ورحلته.
 *
 * يستدعيها: إنشاء درس جديد (LessonService)، الـ Seeder، الاختبارات،
 * وأمر الترحيل lesson:sync-blocks. بهذا لا يتكرر منطق بناء الرحلة في أكثر من مكان.
 */
class LessonTemplateBuilder
{
    public function __construct(
        private readonly LessonEditorService $editor,
        private readonly LessonBlockService $blockService,
    ) {}

    /**
     * قالب الرحلة الافتراضي لدرس جديد: تقييم قبلي ← فقرة ← تقييم ختامي.
     */
    public function buildDefault(Lesson $lesson): void
    {
        $this->editor->addPreAssessment($lesson->id, ['title' => 'تقييم قبلي']);
        $this->editor->addParagraph($lesson->id, ['title' => 'فقرة الدرس', 'content' => '<p></p>']);
        $this->editor->addFinalAssessment($lesson->id, ['title' => 'تقييم ختامي']);
    }

    /**
     * يربط محتوى الدرس الموجود (فقرات + تقييمات + فيديو شامل) ككتل في الرحلة.
     *
     * Idempotent: يتخطى أي محتوى له كتلة سابقة. الترتيب: الفقرات ثم التقييمات
     * ثم الفيديو الشامل (إن وُجد للدرس).
     */
    public function attachExistingContent(Lesson $lesson): void
    {
        foreach ($lesson->paragraphs()->orderBy('sort_order')->get() as $paragraph) {
            if ($this->blockService->blocks($lesson->id)->where('paragraph_id', $paragraph->id)->isNotEmpty()) {
                continue;
            }
            $this->blockService->createBlock($lesson->id, BlockKind::Paragraph, paragraphId: $paragraph->id);
        }

        foreach ($lesson->assessments()->orderBy('sort_order')->get() as $assessment) {
            if ($this->blockService->blocks($lesson->id)->where('assessment_id', $assessment->id)->isNotEmpty()) {
                continue;
            }
            $kind = BlockKind::fromAssessmentType($assessment->type);
            if ($kind === null) {
                continue;
            }
            $this->blockService->createBlock($lesson->id, $kind, assessmentId: $assessment->id);
        }

        $hasVideoBlock = $this->blockService->blocks($lesson->id)
            ->contains(fn ($block) => $block->block_kind === BlockKind::LessonVideo->value);
        if (! empty($lesson->video) && ! $hasVideoBlock) {
            $this->blockService->createBlock($lesson->id, BlockKind::LessonVideo);
        }
    }
}

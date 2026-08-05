<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Assessment\Models\Assessment;
use App\Domains\Assessment\Services\AssessmentService;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\LessonBlock;

/**
 * Use Cases لمحرر الدرس — إضافة أنواع العناصر والترتيب والنشر والحذف.
 *
 * المحرر هو بوابة تأليف المحتوى الوحيدة؛ هنا يُنشأ المحتوى (فقرة/تقييم)
 * مع كتلته في الرحلة بعملية واحدة (Single Source of Truth للإنشاء).
 */
class LessonEditorService
{
    public function __construct(
        private readonly ParagraphService $paragraphService,
        private readonly AssessmentService $assessmentService,
        private readonly LessonBlockService $blockService,
    ) {}

    /**
     * إضافة عنصر للرحلة حسب النوع.
     *
     * @param  array  $payload  يختلف حسب النوع: فقرة (title, content, ...) أو تقييم (title, [paragraph_id]).
     */
    public function add(int $lessonId, BlockKind $kind, array $payload = []): LessonBlock
    {
        return match ($kind) {
            BlockKind::Paragraph => $this->addParagraph($lessonId, $payload),
            BlockKind::PreAssessment,
            BlockKind::FormativeAssessment,
            BlockKind::FinalAssessment => $this->addAssessment($lessonId, $kind, $payload),
            BlockKind::LessonVideo => $this->addLessonVideo($lessonId),
        };
    }

    public function addParagraph(int $lessonId, array $payload): LessonBlock
    {
        $paragraph = $this->paragraphService->createParagraph(array_merge(
            ['lesson_id' => $lessonId],
            array_intersect_key($payload, array_flip(['title', 'type', 'slug', 'image', 'video', 'icon', 'color', 'content']))
        ));

        return $this->blockService->createBlock($lessonId, BlockKind::Paragraph, paragraphId: $paragraph->id);
    }

    public function addPreAssessment(int $lessonId, array $payload = []): LessonBlock
    {
        return $this->addAssessment($lessonId, BlockKind::PreAssessment, $payload);
    }

    public function addFormativeAssessment(int $lessonId, array $payload = []): LessonBlock
    {
        return $this->addAssessment($lessonId, BlockKind::FormativeAssessment, $payload);
    }

    public function addFinalAssessment(int $lessonId, array $payload = []): LessonBlock
    {
        return $this->addAssessment($lessonId, BlockKind::FinalAssessment, $payload);
    }

    public function addLessonVideo(int $lessonId): LessonBlock
    {
        return $this->blockService->createBlock($lessonId, BlockKind::LessonVideo);
    }

    private function addAssessment(int $lessonId, BlockKind $kind, array $payload = []): LessonBlock
    {
        $type = $kind->assessmentType();

        // القبلي والختامي مفردان بطبيعتهما داخل الدرس، فيُعاد استخدام التقييم الموجود
        // عند إضافتهما مجددًا حتى لا تتكرر البيانات.
        // أما التقييم التكويني فقابل للتكرار (بعد كل فقرة)، فيُجدول دائمًا تقييمًا جديدًا.
        $dedupe = in_array($kind, [BlockKind::PreAssessment, BlockKind::FinalAssessment], true);

        $assessment = ($dedupe ? $this->existingAssessment($lessonId, $type) : null)
            ?? $this->assessmentService->createAssessment([
                'lesson_id' => $lessonId,
                'paragraph_id' => $payload['paragraph_id'] ?? null,
                'type' => $type,
                'title' => $payload['title'] ?? null,
                'sort_order' => $this->assessmentService->nextAssessmentOrder($lessonId),
            ]);

        return $this->blockService->createBlock($lessonId, $kind, assessmentId: $assessment->id);
    }

    private function existingAssessment(int $lessonId, string $type): ?Assessment
    {
        return $this->assessmentService->assessments($lessonId, type: $type)->first();
    }

    public function reorder(int $lessonId, array $ids): void
    {
        $this->blockService->updateOrder($lessonId, $ids);
    }

    public function toggleVisibility(int $blockId): LessonBlock
    {
        return $this->blockService->toggleVisibility($blockId);
    }

    public function removeBlock(int $blockId): void
    {
        $this->blockService->deleteBlock($blockId);
    }
}

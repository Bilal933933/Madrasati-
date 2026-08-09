<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\LessonBlock;
use Illuminate\Database\Eloquent\Builder;

/**
 * النسخة التجريبية (Trial) — نافذة تعليمية مصغّرة من درس حقيقي.
 *
 * ليست رحلة مستقلة، بل طبقة قراءة داخل نطاق الدرس: تحلّ درسًا واحدًا
 * (من إعداد أو تلقائيًا) ثم تعرض منه فقط أول فقرة + فيديو قصير (اختياري)
 * + سؤالَي أول تقييم، بلا كشف بقية الكتل.
 */
class TrialService
{
    /** عدد أسئلة نافذة التجربة. */
    private const TRIAL_QUESTION_LIMIT = 2;

    public function __construct(
        private readonly LessonFlowService $flowService,
    ) {}

    /**
     * يحلّ الدرس التجريبي: slug من الإعداد إن وُجد، وإلا أول درس منشور
     * يحتوي على فقرة وتقييم (بترتيب الإنشاء).
     */
    public function resolveLesson(): Lesson
    {
        $base = $this->publishedWithParagraphAndAssessment();

        $slug = config('madrasati.trial_lesson_slug');

        if (is_string($slug) && $slug !== '') {
            $lesson = (clone $base)->where('slug', $slug)->first();

            if ($lesson) {
                return $lesson;
            }
        }

        return $base->orderBy('id')->firstOrFail();
    }

    /**
     * يبني نافذة التجربة من الدرس: يحمّل رحلته كاملة ثم يقتطعها إلى
     * [أول فقرة ← فيديو قصير (اختياري) ← أول تقييم بأول سؤالين].
     * النتيجة تحتفظ بعقدة LessonFlowResource ذاتها (lesson + blocks).
     */
    public function build(Lesson $lesson): Lesson
    {
        $lesson = $this->flowService->flow($lesson);

        $blocks = $lesson->blocks->where('is_published', true);

        $paragraph = $blocks->first(
            fn (LessonBlock $block) => $block->block_kind === BlockKind::Paragraph->value
        );

        $video = $blocks->first(
            fn (LessonBlock $block) => $block->block_kind === BlockKind::LessonVideo->value
        );

        $assessment = $blocks->first(
            fn (LessonBlock $block) => BlockKind::tryFrom($block->block_kind)?->isAssessment() ?? false
        );

        // اقتصار أسئلة التقييم على سؤالَي التجربة فقط (خياراتها محمّلة مسبقًا).
        $assessment?->assessment?->setRelation(
            'questions',
            $assessment->assessment->questions->take(self::TRIAL_QUESTION_LIMIT)
        );

        $lesson->setRelation('blocks', collect([$paragraph, $video, $assessment])->filter()->values());

        return $lesson;
    }

    /**
     * الدروس المنشورة كاملًا (حتى المرحلة) التي تحتوي فقرة وتقييمًا.
     */
    private function publishedWithParagraphAndAssessment(): Builder
    {
        return Lesson::query()
            ->fullyPublished()
            ->hasParagraphBlock()
            ->hasAssessmentBlock();
    }
}

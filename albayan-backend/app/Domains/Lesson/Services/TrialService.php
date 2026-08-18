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
 * (من إعداد أو تلقائيًا) ثم تعرض منه أول فقرتين مع تقييميهما التكوينيين
 * فقط — فتُري الزائر الحلقة الكاملة (فقرة ← قياس فوري ← تغذية راجعة ← فقرة)
 * دون كشف القبلي/الختامي أو بقية الكتل.
 */
class TrialService
{
    /** عدد فقرات نافذة التجربة (مع تقييم تكويني بعد كل واحدة). */
    private const TRIAL_PARAGRAPH_LIMIT = 2;

    /** عدد أسئلة كل تقييم تكويني في نافذة التجربة. */
    private const TRIAL_QUESTION_LIMIT = 2;

    public function __construct(
        private readonly LessonFlowService $flowService,
    ) {}

    /**
     * يحلّ الدرس التجريبي: slug من الإعداد إن وُجد، وإلا أول درس منشور
     * في اللغة العربية يحتوي فقرة وتقييمًا، وإلا أول درس منشور (أي مادة).
     */
    public function resolveLesson(): Lesson
    {
        $slug = config('madrasati.trial_lesson_slug');

        if (is_string($slug) && $slug !== '') {
            $lesson = $this->publishedWithParagraphAndAssessment()
                ->where('slug', $slug)
                ->first();

            if ($lesson) {
                return $lesson;
            }
        }

        // تفضيل اللغة العربية (الدرس الرائد للتجربة) ثم أي مادة أخرى.
        $arabic = $this->publishedWithParagraphAndAssessment()
            ->whereHas('course.subject', fn ($q) => $q->where('name', 'اللغة العربية'))
            ->orderBy('id')
            ->first();

        return $arabic ?? $this->publishedWithParagraphAndAssessment()->orderBy('id')->firstOrFail();
    }

    /**
     * يبني نافذة التجربة من الدرس: يحمّل رحلته كاملة ثم يقتطعها إلى
     * [فقرة 1 ← تقييمها التكويني ← فقرة 2 ← تقييمها التكويني] بترتيبها الرسمي.
     * النتيجة تحتفظ بعقدة LessonFlowResource ذاتها (lesson + blocks).
     */
    public function build(Lesson $lesson): Lesson
    {
        $lesson = $this->flowService->flow($lesson);

        $blocks = $lesson->blocks->where('is_published', true);

        // أول فقرتين منشورتين بالترتيب الرسمي للرحلة.
        $paragraphs = $blocks
            ->where('block_kind', BlockKind::Paragraph->value)
            ->sortBy('sort_order')
            ->take(self::TRIAL_PARAGRAPH_LIMIT);

        $trialBlocks = [];

        foreach ($paragraphs as $paragraph) {
            $trialBlocks[] = $paragraph;

            // التقييم التكويني المرتبط بالفقرة (لا قبلي ولا ختامي في النافذة).
            $formative = $blocks->first(
                fn (LessonBlock $block) => $block->block_kind === BlockKind::FormativeAssessment->value
                    && $block->assessment?->paragraph_id === $paragraph->paragraph_id
            );

            if ($formative === null) {
                continue;
            }

            // اقتصار أسئلة التكويني على سقف التجربة (خياراتها محمّلة مسبقًا).
            $formative->assessment->setRelation(
                'questions',
                $formative->assessment->questions->take(self::TRIAL_QUESTION_LIMIT)
            );

            $trialBlocks[] = $formative;
        }

        $lesson->setRelation('blocks', collect($trialBlocks)->values());

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

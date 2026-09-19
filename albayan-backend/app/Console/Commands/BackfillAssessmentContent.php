<?php

namespace App\Console\Commands;

use App\Domains\Assessment\Models\Assessment;
use App\Domains\Assessment\Services\AssessmentService;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Lesson\Models\Lesson;
use Database\Seeders\Data\ContentCatalog;
use Database\Seeders\Prep3\Data\Arabic;
use Database\Seeders\Prep3\Data\Math;
use Database\Seeders\Prep3\Data\Science;
use Database\Seeders\Prep3\Data\SocialStudies;
use Illuminate\Console\Command;

/**
 * تعبئة راجعة لمحتوى التقييمات: يضمن أن كل درس مزروع يملك أسئلته
 * وخيارات أسئلة الاختيار — Idempotent، آمن للتكرار.
 *
 * يغطي دروس ContentCatalog ودروس Prep3 معًا، بمطابقة الدرس
 * عبر (اسم المقرر + عنوان الدرس) ثم نص السؤال.
 */
class BackfillAssessmentContent extends Command
{
    protected $signature = 'assessment:backfill-content';

    protected $description = 'تعبئة الأسئلة والخيارات الناقصة للدروس المزروعة (يدعم التكرار بأمان).';

    public function handle(AssessmentService $assessments): int
    {
        $plans = [
            ...ContentCatalog::plans(),
            ...Arabic::plans(),
            ...Math::plans(),
            ...Science::plans(),
            ...SocialStudies::plans(),
        ];

        $lessonsFixed = 0;
        $questionsCreated = 0;
        $optionsCreated = 0;

        foreach ($plans as $plan) {
            foreach ($plan['lessons'] as $spec) {
                $lesson = $this->findLesson($plan['unit'], $spec['title']);

                if ($lesson === null) {
                    continue;
                }

                [$q, $o] = $this->backfillLesson($lesson, $spec, $assessments);
                $questionsCreated += $q;
                $optionsCreated += $o;
                if ($q > 0 || $o > 0) {
                    $lessonsFixed++;
                }
            }
        }

        $this->info("الدروس المُصلحة: {$lessonsFixed} — أسئلة مُنشأة: {$questionsCreated} — خيارات مُنشأة: {$optionsCreated}.");

        return self::SUCCESS;
    }

    private function findLesson(string $unit, string $title): ?Lesson
    {
        $byTitle = Lesson::query()->where('title', $title)->with('course')->get();

        if ($byTitle->isEmpty()) {
            return null;
        }

        if ($byTitle->count() === 1) {
            return $byTitle->first();
        }

        return $byTitle->firstWhere(fn (Lesson $l) => $l->course?->name === $unit)
            ?? $byTitle->first();
    }

    /**
     * @return array{0:int,1:int} [أسئلة مُنشأة, خيارات مُنشأة]
     */
    private function backfillLesson(Lesson $lesson, array $spec, AssessmentService $assessments): array
    {
        $questionsCreated = 0;
        $optionsCreated = 0;

        $blocks = $lesson->blocks()->orderBy('sort_order')->orderBy('id')->get();

        $preBlock = $blocks->firstWhere('block_kind', BlockKind::PreAssessment->value);
        $finalBlock = $blocks->firstWhere('block_kind', BlockKind::FinalAssessment->value);
        $formativeBlocks = $blocks->where('block_kind', BlockKind::FormativeAssessment->value)->values();

        if ($preBlock?->assessment_id) {
            [$q, $o] = $this->backfillAssessment($assessments, $preBlock->assessment_id, $spec['pre'] ?? []);
            $questionsCreated += $q;
            $optionsCreated += $o;
        }

        $expectedFormatives = [];
        foreach ($spec['paragraphs'] ?? [] as $paragraph) {
            if (! empty($paragraph['formative'])) {
                $expectedFormatives[] = $paragraph['formative'];
            }
        }

        foreach ($formativeBlocks as $index => $block) {
            if (! $block->assessment_id || ! isset($expectedFormatives[$index])) {
                continue;
            }
            [$q, $o] = $this->backfillAssessment($assessments, $block->assessment_id, $expectedFormatives[$index]);
            $questionsCreated += $q;
            $optionsCreated += $o;
        }

        if ($finalBlock?->assessment_id) {
            [$q, $o] = $this->backfillAssessment($assessments, $finalBlock->assessment_id, $spec['final'] ?? []);
            $questionsCreated += $q;
            $optionsCreated += $o;
        }

        return [$questionsCreated, $optionsCreated];
    }

    /**
     * @return array{0:int,1:int} [أسئلة مُنشأة, خيارات مُنشأة]
     */
    private function backfillAssessment(AssessmentService $assessments, int $assessmentId, array $expected): array
    {
        $assessment = Assessment::query()->with(['questions.options'])->find($assessmentId);

        if ($assessment === null) {
            return [0, 0];
        }

        $questionsCreated = 0;
        $optionsCreated = 0;

        foreach ($expected as $order => $question) {
            $existing = $assessment->questions->firstWhere('content', $question['q'])
                ?? $assessment->questions->get($order);

            if ($existing === null) {
                $existing = $assessments->createQuestion([
                    'assessment_id' => $assessment->id,
                    'type' => $question['kind'],
                    'content' => $question['q'],
                    'explanation' => $question['explanation'] ?? null,
                    'correct_answer' => $question['kind'] === 'true_false' ? $question['answer'] : null,
                    'sort_order' => $order,
                ]);
                $existing->load('options');
                $assessment->questions->push($existing);
                $questionsCreated++;
            } elseif ($existing->type === 'true_false' && $existing->correct_answer === null && isset($question['answer'])) {
                $existing->update(['correct_answer' => $question['answer']]);
                $existing->refresh();
            }

            if ($question['kind'] === 'mcq' && $existing->options->isEmpty()) {
                foreach ($question['options'] as $optionOrder => $optionContent) {
                    $assessments->createOption([
                        'question_id' => $existing->id,
                        'content' => $optionContent,
                        'is_correct' => $optionOrder === $question['answer'],
                        'sort_order' => $optionOrder,
                    ]);
                    $optionsCreated++;
                }
                $existing->load('options');
            }
        }

        return [$questionsCreated, $optionsCreated];
    }
}

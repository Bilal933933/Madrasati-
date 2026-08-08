<?php

namespace App\Domains\Exam\Services;

use App\Domains\Exam\Models\BankQuestion;
use App\Domains\Exam\Models\ExamBlueprint;
use Illuminate\Support\Collection;

/**
 * محرك توليد أسئلة الامتحان:
 * - يسحب الأسئلة من بنك الأسئلة ضمن نطاق blueprint مع توزيع حسب الصعوبة.
 * - يخلط ترتيب الأسئلة والخيارات (بذر عشوائي).
 * - يبني لقطة (Snapshot) معزولة تحتوي الحلول المخفية للتصحيح.
 */
class ExamGeneratorService
{
    /**
     * اختيار أسئلة الامتحان من البنك حسب difficulty counts.
     *
     * @return Collection<int, BankQuestion>
     */
    public function selectQuestions(ExamBlueprint $blueprint, ExamBlueprintService $scopeService): Collection
    {
        $lessonIds = $scopeService->scopeLessons($blueprint)->pluck('id');

        $questions = collect();

        foreach (['easy' => $blueprint->easy_count, 'medium' => $blueprint->medium_count, 'hard' => $blueprint->hard_count] as $difficulty => $count) {
            if ($count <= 0) {
                continue;
            }

            $picked = BankQuestion::query()
                ->active()
                ->whereIn('lesson_id', $lessonIds)
                ->where('difficulty', $difficulty)
                ->inRandomOrder()
                ->limit($count)
                ->get();

            $questions = $questions->concat($picked);
        }

        // خلط نهائي لتجنّب "الصعوبة بالترتيب" الظاهر للطالب.
        return $questions
            ->unique('id')
            ->shuffle()
            ->values();
    }

    /**
     * بناء قيمة الـ snapshot لسؤال داخل محاولة — تشمل الحل المخفي.
     */
    public function buildSnapshot(BankQuestion $question): array
    {
        $snapshot = [
            'content' => $question->content,
            'type' => $question->type,
            'difficulty' => $question->difficulty,
            'explanation' => $question->explanation,
        ];

        if ($question->isTrueFalse()) {
            $snapshot['correct_boolean'] = $question->trueFalseAnswer();
        } elseif ($question->isMcq()) {
            // خلط الخيارات + حفظ ترتيب القوالب الجديد في الـ snapshot
            $options = $question->options->map(fn ($opt) => [
                'id' => $opt->id,
                'content' => $opt->content,
                'is_correct' => $opt->is_correct,
            ])->shuffle()->values();

            $snapshot['options'] = $options->toArray();
            $correct = $options->firstWhere('is_correct', true);
            $snapshot['correct_option_id'] = $correct['id'] ?? null;
        }

        return $snapshot;
    }
}

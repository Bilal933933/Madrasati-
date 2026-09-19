<?php

namespace App\Domains\Exam\Services;

use App\Domains\Exam\Models\BankQuestion;
use App\Domains\Exam\Models\BankQuestionOption;
use Illuminate\Database\Eloquent\Collection;

/**
 * منطق عمليات بنك الأسئلة (Bank Questions):
 * إدارة الأسئلة وخياراتها المرتبطة بالدروس — مصدر أسئلة الامتحانات المستقل عن تقييمات الدرس.
 */
class ExamBankService
{
    public function questions(?int $lessonId = null, ?string $difficulty = null, ?string $type = null): Collection
    {
        return BankQuestion::query()
            ->when($lessonId, fn ($q) => $q->where('lesson_id', $lessonId))
            ->when($difficulty, fn ($q) => $q->where('difficulty', $difficulty))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->with('options')
            ->orderByDesc('id')
            ->get();
    }

    public function findQuestion(int $id): BankQuestion
    {
        return BankQuestion::with('options')->findOrFail($id);
    }

    /**
     * إنشاء سؤال من البنك مع خياراته (إن كان MCQ).
     */
    public function createQuestion(array $data): BankQuestion
    {
        $question = BankQuestion::create([
            'lesson_id' => $data['lesson_id'],
            'type' => $data['type'],
            'content' => $data['content'],
            'explanation' => $data['explanation'] ?? null,
            'correct_answer' => $data['correct_answer'] ?? null,
            'difficulty' => $data['difficulty'],
            'is_active' => $data['is_active'] ?? true,
            // حقول الأنواع النصية/الرقمية (تصحيح المساعد الذكي)
            'model_answer' => $data['model_answer'] ?? null,
            'accepted_answers' => $data['accepted_answers'] ?? null,
            'case_sensitive' => $data['case_sensitive'] ?? false,
            'rubric' => $data['rubric'] ?? null,
            'correct_value' => $data['correct_value'] ?? null,
            'tolerance' => $data['tolerance'] ?? 0,
            'units' => $data['units'] ?? null,
        ]);

        foreach ($data['options'] ?? [] as $index => $option) {
            BankQuestionOption::create([
                'bank_question_id' => $question->id,
                'content' => $option['content'],
                'is_correct' => (bool) ($option['is_correct'] ?? false),
                'sort_order' => $index + 1,
            ]);
        }

        return $question->load('options');
    }

    /**
     * تحديث سؤال البنك — يُستبدل نطاق الخيارات بالكامل.
     */
    public function updateQuestion(int $id, array $data): BankQuestion
    {
        $question = BankQuestion::findOrFail($id);
        $question->update([
            'lesson_id' => $data['lesson_id'] ?? $question->lesson_id,
            'type' => $data['type'] ?? $question->type,
            'content' => $data['content'] ?? $question->content,
            'explanation' => array_key_exists('explanation', $data) ? $data['explanation'] : $question->explanation,
            'correct_answer' => array_key_exists('correct_answer', $data) ? $data['correct_answer'] : $question->correct_answer,
            'difficulty' => $data['difficulty'] ?? $question->difficulty,
            'is_active' => $data['is_active'] ?? $question->is_active,
            // حقول الأنواع النصية/الرقمية (تصحيح المساعد الذكي)
            'model_answer' => array_key_exists('model_answer', $data) ? $data['model_answer'] : $question->model_answer,
            'accepted_answers' => array_key_exists('accepted_answers', $data) ? $data['accepted_answers'] : $question->accepted_answers,
            'case_sensitive' => array_key_exists('case_sensitive', $data) ? $data['case_sensitive'] : $question->case_sensitive,
            'rubric' => array_key_exists('rubric', $data) ? $data['rubric'] : $question->rubric,
            'correct_value' => array_key_exists('correct_value', $data) ? $data['correct_value'] : $question->correct_value,
            'tolerance' => array_key_exists('tolerance', $data) ? $data['tolerance'] : $question->tolerance,
            'units' => array_key_exists('units', $data) ? $data['units'] : $question->units,
        ]);

        if (array_key_exists('options', $data)) {
            $question->options()->delete();
            foreach ($data['options'] as $index => $option) {
                BankQuestionOption::create([
                    'bank_question_id' => $question->id,
                    'content' => $option['content'],
                    'is_correct' => (bool) ($option['is_correct'] ?? false),
                    'sort_order' => $index + 1,
                ]);
            }
        }

        return $question->load('options');
    }

    public function deleteQuestion(int $id): void
    {
        BankQuestion::findOrFail($id)->delete();
    }
}

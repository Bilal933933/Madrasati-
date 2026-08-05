<?php

namespace App\Domains\Assessment\Services;

use App\Domains\Assessment\Models\Assessment;
use App\Domains\Assessment\Models\Option;
use App\Domains\Assessment\Models\Question;
use Illuminate\Database\Eloquent\Collection;

/**
 * منطق عمليات دومين التقييم (Assessment).
 * أنواع التقييم: pre (مبدئي) / formative (تكويني) / final (ختامي).
 * بنية هرمية: Assessment ← Questions ← Options.
 */
class AssessmentService
{
    /* ---------------------------------- Assessments ---------------------------------- */

    public function assessments(?int $lessonId = null, ?int $paragraphId = null, ?string $type = null): Collection
    {
        return Assessment::query()
            ->when($lessonId, fn ($q) => $q->where('lesson_id', $lessonId))
            ->when($paragraphId, fn ($q) => $q->where('paragraph_id', $paragraphId))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderBy('sort_order')
            ->get();
    }

    public function nextAssessmentOrder(int $lessonId): int
    {
        return (Assessment::query()->where('lesson_id', $lessonId)->max('sort_order') ?? 0) + 1;
    }

    public function publishedAssessments(?int $lessonId = null, ?int $paragraphId = null, ?string $type = null): Collection
    {
        return Assessment::query()
            ->when($lessonId, fn ($q) => $q->where('lesson_id', $lessonId))
            ->when($paragraphId, fn ($q) => $q->where('paragraph_id', $paragraphId))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->whereHas('lesson', fn ($ql) => $ql->where('is_published', true)
                ->whereHas('course', fn ($qc) => $qc->where('is_published', true)
                    ->whereHas('subject', fn ($qs) => $qs->where('is_published', true)
                        ->whereHas('grade', fn ($qg) => $qg->where('is_published', true)
                            ->whereHas('stage', fn ($qst) => $qst->where('is_published', true))))))
            ->with(['questions' => fn ($qq) => $qq->orderBy('sort_order')
                ->with(['options' => fn ($qo) => $qo->orderBy('sort_order')])])
            ->orderBy('sort_order')
            ->get();
    }

    public function publishedAssessment(int $id): Assessment
    {
        return Assessment::query()
            ->whereHas('lesson', fn ($ql) => $ql->where('is_published', true)
                ->whereHas('course', fn ($qc) => $qc->where('is_published', true)
                    ->whereHas('subject', fn ($qs) => $qs->where('is_published', true)
                        ->whereHas('grade', fn ($qg) => $qg->where('is_published', true)
                            ->whereHas('stage', fn ($qst) => $qst->where('is_published', true))))))
            ->with(['questions' => fn ($qq) => $qq->orderBy('sort_order')
                ->with(['options' => fn ($qo) => $qo->orderBy('sort_order')])])
            ->findOrFail($id);
    }

    public function findAssessment(int $id): Assessment
    {
        return Assessment::query()
            ->with(['questions' => fn ($qq) => $qq->orderBy('sort_order')
                ->with(['options' => fn ($qo) => $qo->orderBy('sort_order')])])
            ->findOrFail($id);
    }

    public function createAssessment(array $data): Assessment
    {
        return Assessment::create($data);
    }

    public function updateAssessment(int $id, array $data): Assessment
    {
        $assessment = Assessment::findOrFail($id);
        $assessment->update($data);

        return $assessment;
    }

    public function deleteAssessment(int $id): void
    {
        Assessment::findOrFail($id)->delete();
    }

    /* ---------------------------------- Questions ---------------------------------- */

    public function questions(int $assessmentId): Collection
    {
        return Question::query()
            ->where('assessment_id', $assessmentId)
            ->orderBy('sort_order')
            ->get();
    }

    public function nextQuestionOrder(int $assessmentId): int
    {
        return (Question::query()->where('assessment_id', $assessmentId)->max('sort_order') ?? 0) + 1;
    }

    public function findQuestion(int $id): Question
    {
        return Question::findOrFail($id);
    }

    public function createQuestion(array $data): Question
    {
        return Question::create($data);
    }

    public function updateQuestion(int $id, array $data): Question
    {
        $question = Question::findOrFail($id);
        $question->update($data);

        return $question;
    }

    public function deleteQuestion(int $id): void
    {
        Question::findOrFail($id)->delete();
    }

    /* ---------------------------------- Options ---------------------------------- */

    public function options(int $questionId): Collection
    {
        return Option::query()
            ->where('question_id', $questionId)
            ->orderBy('sort_order')
            ->get();
    }

    public function nextOptionOrder(int $questionId): int
    {
        return (Option::query()->where('question_id', $questionId)->max('sort_order') ?? 0) + 1;
    }

    public function findOption(int $id): Option
    {
        return Option::findOrFail($id);
    }

    public function createOption(array $data): Option
    {
        return Option::create($data);
    }

    public function updateOption(int $id, array $data): Option
    {
        $option = Option::findOrFail($id);
        $option->update($data);

        return $option;
    }

    public function deleteOption(int $id): void
    {
        Option::findOrFail($id)->delete();
    }
}

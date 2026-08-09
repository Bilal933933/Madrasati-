<?php

namespace App\Domains\Exam\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Progress\Models\LessonCompletion;
use Illuminate\Support\Collection;

/**
 * فتح الامتحانات تلقائيًا: الامتحان يُفتح عند إكمال الطالب كل دروس النطاق.
 */
class ExamUnlockService
{
    public function __construct(private readonly ExamBlueprintService $scopeService) {}

    /**
     * دروس النطاق المطلوب إكمالها لفتح الامتحان.
     */
    public function requiredLessonIds(ExamBlueprint $blueprint): Collection
    {
        return $this->scopeService->scopeLessons($blueprint)->pluck('id');
    }

    /**
     * هل الامتحان مفتوح للطالب؟
     */
    public function isUnlocked(User $user, ExamBlueprint $blueprint): bool
    {
        return $this->completedLessonIds($user, $blueprint)->count() === $this->requiredLessonIds($blueprint)->count();
    }

    /**
     * تقدّم الطالب في فتح النطاق (عدد الدروس المكتملة من الإجمالي).
     */
    public function progress(User $user, ExamBlueprint $blueprint): array
    {
        $required = $this->requiredLessonIds($blueprint);
        $completed = $this->completedLessonIds($user, $blueprint);

        return [
            'total' => $required->count(),
            'completed' => $completed->count(),
            'unlocked' => $this->isUnlocked($user, $blueprint),
        ];
    }

    /**
     * معرّفات دروس النطاق التي أكملها الطالب.
     */
    private function completedLessonIds(User $user, ExamBlueprint $blueprint): Collection
    {
        $required = $this->requiredLessonIds($blueprint);

        if ($required->isEmpty()) {
            return collect();
        }

        return LessonCompletion::query()
            ->forUser($user)
            ->completed()
            ->inLessons($required)
            ->pluck('lesson_id');
    }
}

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
     * تقدّم فتح كل الامتحانات دفعة واحدة — بجلب واحد لسجلات إكمال الطالب
     * بدل استعلام لكل blueprint (يستأصل N+1 في قائمة الامتحانات).
     *
     * @param  \Illuminate\Support\Collection<int, ExamBlueprint>  $blueprints
     * @return array<int, array{total: int, completed: int, unlocked: bool}>
     */
    public function progressForBlueprints(User $user, Collection $blueprints): array
    {
        $progress = [];

        $idsByBlueprint = [];
        $allRequired = collect();

        foreach ($blueprints as $blueprint) {
            $required = $this->requiredLessonIds($blueprint);
            $idsByBlueprint[$blueprint->id] = $required;
            $allRequired = $allRequired->merge($required);
        }

        $uniqueRequired = $allRequired->unique();

        $completedIds = $uniqueRequired->isEmpty()
            ? collect()
            : LessonCompletion::query()
                ->forUser($user)
                ->completed()
                ->inLessons($uniqueRequired)
                ->pluck('lesson_id');

        foreach ($blueprints as $blueprint) {
            $required = $idsByBlueprint[$blueprint->id];
            $completed = $required->isEmpty()
                ? 0
                : $completedIds->intersect($required->all())->count();

            $progress[$blueprint->id] = [
                'total' => $required->count(),
                'completed' => $completed,
                'unlocked' => $completed === $required->count(),
            ];
        }

        return $progress;
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

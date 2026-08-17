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
     *
     * امتحان requires_completion=false (الافتراضي) متاح دائمًا دون إكمال الدروس.
     */
    public function isUnlocked(User $user, ExamBlueprint $blueprint): bool
    {
        if (! $blueprint->requires_completion) {
            return true;
        }

        return $this->completedLessonIds($user, $blueprint)->count() === $this->requiredLessonIds($blueprint)->count();
    }

    /**
     * تقدّم الطالب في فتح النطاق (عدد الدروس المكتملة من الإجمالي + النسبة).
     */
    public function progress(User $user, ExamBlueprint $blueprint): array
    {
        $required = $this->requiredLessonIds($blueprint);
        $total = $required->count();

        if (! $blueprint->requires_completion) {
            return [
                'total' => $total,
                'completed' => $total,
                'unlocked' => true,
                'percent' => 100,
            ];
        }

        $completed = $this->completedLessonIds($user, $blueprint)->count();
        $unlocked = $completed === $total;

        return [
            'total' => $total,
            'completed' => $completed,
            'unlocked' => $unlocked,
            'percent' => $unlocked ? 100 : ($total > 0 ? (int) round($completed * 100 / $total) : 0),
        ];
    }

    /**
     * تقدّم فتح كل الامتحانات دفعة واحدة — بجلب واحد لسجلات إكمال الطالب
     * بدل استعلام لكل blueprint (يستأصل N+1 في قائمة الامتحانات).
     *
     * @param  Collection<int, ExamBlueprint>  $blueprints
     * @return array<int, array{total: int, completed: int, unlocked: bool, percent: int}>
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
            $total = $required->count();

            if (! $blueprint->requires_completion) {
                $progress[$blueprint->id] = [
                    'total' => $total,
                    'completed' => $total,
                    'unlocked' => true,
                    'percent' => 100,
                ];

                continue;
            }

            $completed = $required->isEmpty()
                ? 0
                : $completedIds->intersect($required->all())->count();
            $unlocked = $completed === $total;

            $progress[$blueprint->id] = [
                'total' => $total,
                'completed' => $completed,
                'unlocked' => $unlocked,
                'percent' => $unlocked ? 100 : ($total > 0 ? (int) round($completed * 100 / $total) : 0),
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

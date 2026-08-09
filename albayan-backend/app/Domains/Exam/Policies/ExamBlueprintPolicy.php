<?php

namespace App\Domains\Exam\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Exam\Services\ExamBlueprintService;

/**
 * صلاحيات الطالب على تعريفات الامتحانات — النطاق الصفّي/المرحلي.
 */
class ExamBlueprintPolicy
{
    public function __construct(
        private readonly ExamBlueprintService $blueprintService,
    ) {}

    /**
     * هل يستطيع الطالب رؤية تفاصيل هذا الامتحان؟
     */
    public function view(User $user, ExamBlueprint $blueprint): bool
    {
        return $this->inStudentGrade($user, $blueprint);
    }

    /**
     * هل يستطيع الطالب بدء هذا الامتحان؟
     */
    public function take(User $user, ExamBlueprint $blueprint): bool
    {
        return $this->inStudentGrade($user, $blueprint);
    }

    private function inStudentGrade(User $user, ExamBlueprint $blueprint): bool
    {
        $gradeId = $user->profile?->grade_id;
        $stageId = $user->profile?->grade?->stage_id;

        if ($gradeId === null) {
            return false;
        }

        return $this->blueprintService->belongsToStudentGrade($blueprint, $gradeId, $stageId);
    }
}

<?php

namespace App\Domains\Achievement\Listeners;

use App\Domains\Achievement\Services\AchievementService;
use App\Domains\Exam\Events\ExamCompletedEvent;
use App\Domains\Progress\Events\LessonCompletedEvent;

/**
 * يستمع للحظات الفارقة (إكمال درس / تسليم اختبار) ويفتح الأوسمة المستحقة.
 */
class UnlockAchievementsListener
{
    public function __construct(private readonly AchievementService $achievementService) {}

    public function handleLessonCompleted(LessonCompletedEvent $event): void
    {
        $event->unlocked = $this->achievementService->evaluateFor($event->user);
    }

    public function handleExamCompleted(ExamCompletedEvent $event): void
    {
        $event->unlocked = $this->achievementService->evaluateFor($event->user);
    }
}

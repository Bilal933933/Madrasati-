<?php

namespace App\Providers;

use App\Domains\Achievement\Listeners\UnlockAchievementsListener;
use App\Domains\Exam\Events\ExamCompletedEvent;
use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Exam\Policies\ExamAttemptPolicy;
use App\Domains\Exam\Policies\ExamBlueprintPolicy;
use App\Domains\Progress\Events\LessonCompletedEvent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // لحظات فارقة تُنشر من Progress وExam — نظام الإنجازات يستمع لها.
        Event::listen(LessonCompletedEvent::class, [UnlockAchievementsListener::class, 'handleLessonCompleted']);
        Event::listen(ExamCompletedEvent::class, [UnlockAchievementsListener::class, 'handleExamCompleted']);

        // سياسات صلاحيات الامتحانات (الموديلات داخل دومينات — تُسجَّل صراحةً).
        Gate::policy(ExamBlueprint::class, ExamBlueprintPolicy::class);
        Gate::policy(ExamAttempt::class, ExamAttemptPolicy::class);
    }
}

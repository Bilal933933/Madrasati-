<?php

namespace App\Domains\Achievement\Services;

use App\Domains\Achievement\Enums\AchievementMetric;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamAttemptQuestion;
use App\Domains\Progress\Models\LessonCompletion;
use Illuminate\Support\Carbon;

/**
 * حساب قيمة كل مقياس لطالب من البيانات القائمة — نقي، لا يعرف الإنجازات ولا يكسرها.
 */
class AchievementEvaluator
{
    /**
     * قيمة المقياس الحالية للطالب.
     */
    public function value(User $user, AchievementMetric $metric): int
    {
        return match ($metric) {
            AchievementMetric::LessonsCompleted => $this->lessonsCompleted($user),
            AchievementMetric::CoursesCompleted => $this->coursesCompleted($user),
            AchievementMetric::ExamsPassed => $this->examsPassed($user),
            AchievementMetric::CorrectAnswers => $this->correctAnswers($user),
            AchievementMetric::StreakDays => $this->streakDays($user),
        };
    }

    public function lessonsCompleted(User $user): int
    {
        return LessonCompletion::query()
            ->forUser($user)
            ->completed()
            ->count();
    }

    /**
     * عدد المقررات المكتملة: جميع دروسها المنشورة مكتملة للطالب.
     */
    public function coursesCompleted(User $user): int
    {
        $completedLessonIds = LessonCompletion::query()
            ->forUser($user)
            ->completed()
            ->pluck('lesson_id')
            ->all();

        $count = 0;

        Course::query()
            ->where('is_published', true)
            ->with(['lessons' => fn ($q) => $q->where('is_published', true)])
            ->get()
            ->each(function (Course $course) use ($completedLessonIds, &$count) {
                $ids = $course->lessons->pluck('id')->all();

                if ($ids !== [] && array_diff($ids, $completedLessonIds) === []) {
                    $count++;
                }
            });

        return $count;
    }

    public function examsPassed(User $user): int
    {
        return ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('passed', true)
            ->count();
    }

    public function correctAnswers(User $user): int
    {
        return ExamAttemptQuestion::query()
            ->whereHas('attempt', fn ($q) => $q->where('user_id', $user->id))
            ->where('is_correct', true)
            ->count();
    }

    /**
     * أطول سلسلة أيام متتالية فيها نشاط (إكمال درس أو تسليم اختبار).
     * مناسبة كعتبة دائمة: لا تتراجع بمجرد فتحها.
     */
    public function streakDays(User $user): int
    {
        $dates = collect()
            ->merge(
                LessonCompletion::query()
                    ->forUser($user)
                    ->completed()
                    ->pluck('completed_at')
            )
            ->merge(
                ExamAttempt::query()
                    ->where('user_id', $user->id)
                    ->whereNotNull('submitted_at')
                    ->pluck('submitted_at')
            )
            ->map(fn ($date) => Carbon::parse($date)->toDateString())
            ->unique()
            ->sort()
            ->values();

        if ($dates->isEmpty()) {
            return 0;
        }

        $longest = 1;
        $current = 1;

        for ($i = 1; $i < $dates->count(); $i++) {
            $previous = Carbon::parse($dates[$i - 1])->startOfDay();
            $currentDay = Carbon::parse($dates[$i])->startOfDay();
            $gap = (int) $previous->diffInDays($currentDay);

            if ($gap === 1) {
                $current++;
                $longest = max($longest, $current);
            } else {
                $current = 1;
            }
        }

        return $longest;
    }
}

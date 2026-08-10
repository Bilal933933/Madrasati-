<?php

namespace App\Domains\Achievement\Services;

use App\Domains\Achievement\Enums\AchievementMetric;
use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamAttemptQuestion;
use App\Domains\Lesson\Models\Lesson;
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
     *
     * يُحسب بالاستعلام المُجمَّع بدل تحميل النماذج في الذاكرة:
     * عدد الدروس المنشورة لكل مقرر مقابل عدد الدروس المكتملة للطالب — صفر كيانات.
     */
    public function coursesCompleted(User $user): int
    {
        // الدروس المنشورة مجمّعة بعدّها لكل مقرر.
        $publishedPerCourse = Lesson::query()
            ->where('is_published', true)
            ->selectRaw('course_id, COUNT(id) as total')
            ->groupBy('course_id')
            ->pluck('total', 'course_id');

        // المقررات التي أتم الطالب دروسها المنشورة كلها.
        // استعلامان مجمعان: (المكتمل لكل مقرر) ثم مقارنة بالمنشور.
        $completedPerCourse = Lesson::query()
            ->selectRaw('lessons.course_id, COUNT(lesson_completions.id) as done')
            ->join('lesson_completions', 'lesson_completions.lesson_id', '=', 'lessons.id')
            ->where('lessons.is_published', true)
            ->where('lesson_completions.user_id', $user->id)
            ->whereNotNull('lesson_completions.completed_at')
            ->groupBy('lessons.course_id')
            ->pluck('done', 'course_id');

        $count = 0;

        foreach ($publishedPerCourse as $courseId => $total) {
            $done = $completedPerCourse[$courseId] ?? 0;

            if ($total > 0 && (int) $done >= (int) $total) {
                $count++;
            }
        }

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

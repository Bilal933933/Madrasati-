<?php

namespace App\Domains\Analytics\Services;

use App\Domains\Achievement\Models\UserAchievement;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Progress\Models\LessonCompletion;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * تجميع مؤشرات المنصة العامة للوحة إحصائيات الأدمن.
 */
class AnalyticsService
{
    /**
     * ملخص المؤشرات العامة + سلسلة النشاط الشهري لآخر 12 شهرًا.
     */
    public function summary(): array
    {
        $now = CarbonImmutable::now();

        $studentsCount = User::query()->where('role', 'student')->count();
        $teachersCount = User::query()->where('role', 'teacher')->count();
        $adminsCount = User::query()->where('role', 'admin')->count();
        $lessonsCount = Lesson::query()->count();
        $coursesCount = Course::query()->count();

        $completedLessons = LessonCompletion::query()
            ->whereNotNull('completed_at')
            ->count();

        $completionRate = $lessonsCount > 0 && $studentsCount > 0
            ? round(($completedLessons / ($lessonsCount * $studentsCount)) * 100, 1)
            : 0.0;

        $attemptsCount = ExamAttempt::query()
            ->where('status', 'completed')
            ->count();
        $examsPassed = ExamAttempt::query()
            ->where('status', 'completed')
            ->where('passed', true)
            ->count();
        $avgScore = ExamAttempt::query()
            ->where('status', 'completed')
            ->avg('score_percentage');
        $achievementsUnlocked = UserAchievement::query()->count();

        return [
            'counts' => [
                'students' => $studentsCount,
                'teachers' => $teachersCount,
                'admins' => $adminsCount,
                'lessons' => $lessonsCount,
                'courses' => $coursesCount,
                'completed_lessons' => $completedLessons,
                'completion_rate_percent' => $completionRate,
                'exam_attempts' => $attemptsCount,
                'exams_passed' => $examsPassed,
                'avg_score_percent' => $avgScore !== null ? round((float) $avgScore, 1) : 0.0,
                'achievements_unlocked' => $achievementsUnlocked,
            ],
            'monthly' => $this->monthlyActivity($now),
        ];
    }

    /**
     * إكمالات الدروس ومحاولات الامتحانات شهريًا لآخر 12 شهرًا (بما فيها الأشهر الفارغة).
     */
    private function monthlyActivity(CarbonImmutable $now): Collection
    {
        $months = collect(range(0, 11))
            ->map(fn (int $i) => $now->subMonths(11 - $i))
            ->mapWithKeys(fn (CarbonImmutable $d) => [$d->format('Y-m') => $d->format('Y-m')]);

        $completions = $this->groupByMonth('lesson_completions', 'completed_at', $months);
        $attempts = $this->groupByMonth('exam_attempts', 'submitted_at', $months);

        return $months->map(function (string $month) use ($completions, $attempts) {
            return [
                'month' => $month,
                'completed_lessons' => $completions->get($month, 0),
                'exam_attempts' => $attempts->get($month, 0),
            ];
        })->values();
    }

    private function groupByMonth(string $table, string $column, Collection $months): Collection
    {
        // strftime تعمل في SQLite فقط؛ PostgreSQL يستخدم to_char
        $monthExpression = DB::getDriverName() === 'pgsql'
            ? sprintf("to_char(%s, 'YYYY-MM')", $column)
            : sprintf("strftime('%%Y-%%m', %s)", $column);

        $rows = DB::table($table)
            ->selectRaw("{$monthExpression} as month, count(*) as total")
            ->whereNotNull($column)
            ->where($column, '>=', $months->first().'-01')
            ->groupBy('month')
            ->get();

        return $rows->mapWithKeys(fn (object $row) => [$row->month => (int) $row->total]);
    }
}

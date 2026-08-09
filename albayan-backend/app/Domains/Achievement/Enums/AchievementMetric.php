<?php

namespace App\Domains\Achievement\Enums;

/**
 * مقاييس الإنجازات — كل مقياس يُشتق من بيانات قائمة (دروس/اختبارات) بلا عدّادات مخزّنة.
 */
enum AchievementMetric: string
{
    case LessonsCompleted = 'lessons_completed';
    case CoursesCompleted = 'courses_completed';
    case ExamsPassed = 'exams_passed';
    case CorrectAnswers = 'correct_answers';
    case StreakDays = 'streak_days';

    /**
     * تسمية عربية للعرض (قائمة المنسدلة في الإدارة).
     */
    public function label(): string
    {
        return match ($this) {
            self::LessonsCompleted => 'دروس مكتملة',
            self::CoursesCompleted => 'مقررات مكتملة',
            self::ExamsPassed => 'اختبارات ناجحة',
            self::CorrectAnswers => 'أسئلة صحيحة',
            self::StreakDays => 'أيام متتالية',
        };
    }
}

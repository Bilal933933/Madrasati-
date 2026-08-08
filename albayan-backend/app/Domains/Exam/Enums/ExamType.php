<?php

namespace App\Domains\Exam\Enums;

/**
 * أنواع الامتحانات حسب النطاق التعليمي.
 */
enum ExamType: string
{
    case Lesson = 'lesson';
    case Unit = 'unit';
    case Monthly = 'monthly';
    case Semester = 'semester';
    case Full = 'full';

    /**
     * تسمية عربية للعرض.
     */
    public function label(): string
    {
        return match ($this) {
            self::Lesson => 'امتحان الدرس',
            self::Unit => 'امتحان الوحدة',
            self::Monthly => 'امتحان شهري',
            self::Semester => 'امتحان فصلي',
            self::Full => 'امتحان شامل',
        };
    }
}

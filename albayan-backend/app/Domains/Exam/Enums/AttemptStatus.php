<?php

namespace App\Domains\Exam\Enums;

/**
 * حالات محاولة الامتحان.
 * - in_progress: الطالب يجيب
 * - submitted: الطالب سلّم، جاري التصحيح (للأسئلة النصية بالذكاء الاصطناعي)
 * - graded: انتهى التصحيح بالكامل
 */
enum AttemptStatus: string
{
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Graded = 'graded';
}

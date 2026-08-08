<?php

namespace App\Domains\Exam\Enums;

/**
 * حالات محاولة الامتحان.
 */
enum AttemptStatus: string
{
    case InProgress = 'in_progress';
    case Completed = 'completed';
}

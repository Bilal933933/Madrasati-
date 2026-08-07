<?php

namespace App\Domains\Progress\Enums;

/**
 * حالة تقدّم الطالب في مادة أو مقرر، مشتقة من سجلات الإكمال.
 */
enum ProgressStatus: string
{
    case NotStarted = 'not_started';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}

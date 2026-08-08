<?php

namespace App\Domains\Exam\Enums;

/**
 * مستويات صعوبة أسئلة الامتحان.
 */
enum Difficulty: string
{
    case Easy = 'easy';
    case Medium = 'medium';
    case Hard = 'hard';
}

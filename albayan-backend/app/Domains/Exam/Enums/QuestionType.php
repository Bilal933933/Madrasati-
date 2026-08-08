<?php

namespace App\Domains\Exam\Enums;

/**
 * أنواع الأسئلة في بنك الأسئلة والامتحانات.
 */
enum QuestionType: string
{
    case Mcq = 'mcq';
    case TrueFalse = 'true_false';
}

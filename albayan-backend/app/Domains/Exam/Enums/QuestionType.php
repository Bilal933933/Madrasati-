<?php

namespace App\Domains\Exam\Enums;

/**
 * أنواع الأسئلة في بنك الأسئلة والامتحانات.
 * - mcq: متعدد الخيارات
 * - true_false: صح/خطأ
 * - short_answer: إجابة قصيرة (كلمة/عبارة/أكمل الفراغ) — تصحيح ذكي
 * - essay: سؤال مقالي (محرر نصي طويل) — تصحيح ذكي
 * - numeric: إجابة رقمية (قيمة + سماحية) — تصحيح ذكي
 */
enum QuestionType: string
{
    case Mcq = 'mcq';
    case TrueFalse = 'true_false';
    case ShortAnswer = 'short_answer';
    case Essay = 'essay';
    case Numeric = 'numeric';

    public function isDeterministic(): bool
    {
        return in_array($this, [self::Mcq, self::TrueFalse]);
    }

    public function isAiGraded(): bool
    {
        return in_array($this, [self::ShortAnswer, self::Essay, self::Numeric]);
    }
}

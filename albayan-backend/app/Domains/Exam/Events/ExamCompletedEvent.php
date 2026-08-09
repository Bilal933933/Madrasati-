<?php

namespace App\Domains\Exam\Events;

use App\Domains\Achievement\Models\Achievement;
use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamAttempt;

/**
 * لحظة فارقة تُنشر عند تسليم محاولة امتحان (يدويًا أو بانتهاء الوقت) بعد التصحيح.
 *
 * @property array<int, Achievement> $unlocked الأوسمة المفتوحة — تملؤها المستمعات
 */
class ExamCompletedEvent
{
    /** @var array<int, Achievement> */
    public array $unlocked = [];

    public function __construct(
        public readonly User $user,
        public readonly ExamAttempt $attempt,
    ) {}
}

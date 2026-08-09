<?php

namespace App\Domains\Progress\Events;

use App\Domains\Achievement\Models\Achievement;
use App\Domains\Auth\Models\User;
use App\Domains\Lesson\Models\Lesson;

/**
 * لحظة فارقة تُنشر عند إكمال الطالب درسًا — الأنظمة الأخرى تستمع لها (الإنجازات أولًا).
 *
 * @property array<int, Achievement> $unlocked الأوسمة المفتوحة — تملؤها المستمعات
 */
class LessonCompletedEvent
{
    /** @var array<int, Achievement> */
    public array $unlocked = [];

    public function __construct(
        public readonly User $user,
        public readonly Lesson $lesson,
    ) {}
}

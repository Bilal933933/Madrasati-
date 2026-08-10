<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * كاش صفحة بيت الطالب (Student Home) — يخزّن الخرج المفسّر (Arrays نقية).
 *
 * مفاتيحه per-user لأن الترتيب (آخر مادة) والتقدّم خاصان بكل طالب؛
 * فترة صلاحية قصيرة (120ث) تُحمّي قائمة الامتحانات المفتوحة والمواد
 * دون أن تبدو التقدمات قديمة، وتُبطَل فورًا عند إكمال درس أو تعديل ملف.
 */
class StudentHomeCache
{
    private const TTL = 120;

    public static function key(int $userId): string
    {
        return 'student.home.user-'.$userId;
    }

    public static function remember(int $userId, callable $callback): mixed
    {
        return Cache::remember(self::key($userId), self::TTL, $callback);
    }

    public static function forget(int $userId): void
    {
        Cache::forget(self::key($userId));
    }
}

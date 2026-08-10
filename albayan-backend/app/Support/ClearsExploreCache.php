<?php

namespace App\Support;

/**
 * يُبطله أي تعديل على كيان المنهج (إنشاء/تحديث/حذف) عبر Model events.
 *
 * تُضاف إلى النماذج التي تغيّر خرج الاستكشاف (Stage/Grade/Semester/
 * Subject/Course/Lesson/LessonBlock) — فيصبح كاش الاستكشاف متسقًا
 * مع المحتوى المنشور فور أي تعديل إداري دون أن نعدد المفاتيح.
 */
trait ClearsExploreCache
{
    protected static function bootClearsExploreCache(): void
    {
        static::saved(fn () => ExploreCache::flush());
        static::deleted(fn () => ExploreCache::flush());
    }
}

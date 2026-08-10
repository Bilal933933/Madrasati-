<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * كاش الاستكشاف (Explore) — يخزّن المخرجات العامة (Arrays نقية لا كائنات Eloquent)
 * لأن `cache.serializable_classes => false` يمنع إلغاء تسلسل النماذج.
 *
 * آلية الإبطال عبر "جيل" واحد: أي تعديل على المنهج (Model events) يرفع
 * generation فيُصبح كل المفاتيح المبنية عليه قديمة دفعة واحدة — بلا تعدادها.
 */
class ExploreCache
{
    private const GENERATION_KEY = 'explore.generation';

    private const TTL = 3600;

    /**
     * مفتاح مركّب يضمن العزلة بين الأجيال: explore.v{gen}.{name}:{params}.
     */
    public static function key(string $name, string $params = ''): string
    {
        $generation = (int) Cache::get(self::GENERATION_KEY, 0);

        return 'explore.v'.$generation.'.'.$name.($params !== '' ? ':'.$params : '');
    }

    /**
     * يخزّن ناتج الدالة في الكاش ويعيده — يصلح لقيم Arrays/Scalars فقط.
     */
    public static function remember(string $name, string $params, callable $callback): mixed
    {
        return Cache::remember(self::key($name, $params), self::TTL, $callback);
    }

    /**
     * إبطال كامل: رفع الجيل يجعل كل المفاتيح القديمة بلا قيمة.
     */
    public static function flush(): void
    {
        Cache::increment(self::GENERATION_KEY);
    }
}

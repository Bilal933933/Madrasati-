<?php

namespace App\Domains\Settings\Services;

use App\Domains\Settings\Models\PlatformSetting;

/**
 * إدارة إعدادات المنصة العامة (مخزن مفاتيح/قيم).
 * القيم تُخزَّن JSON للتفرقة بين الأنواع (نص/رقم/منطقي).
 */
class SettingsService
{
    /** الحقول المسموح بها — أي مفتاح خارج هذه القائمة يُرفض. */
    public const FIELDS = [
        'site_name' => 'string',
        'site_logo' => 'string',
        'welcome_message' => 'string',
        'maintenance_mode' => 'boolean',
        'social_facebook' => 'string',
        'social_twitter' => 'string',
        'social_instagram' => 'string',
        'social_youtube' => 'string',
    ];

    public const DEFAULTS = [
        'site_name' => 'مدرستي',
        'site_logo' => null,
        'welcome_message' => null,
        'maintenance_mode' => false,
        'social_facebook' => null,
        'social_twitter' => null,
        'social_instagram' => null,
        'social_youtube' => null,
    ];

    /**
     * كل الإعدادات مع القيم الافتراضية للمفاتيح غير المحفوظة بعد.
     */
    public function all(): array
    {
        $stored = PlatformSetting::query()
            ->whereIn('key', array_keys(self::FIELDS))
            ->pluck('value', 'key')
            ->map(fn (?string $value) => $value !== null ? json_decode($value, true) : null)
            ->toArray();

        return array_replace(self::DEFAULTS, $stored);
    }

    /**
     * تحديث جزئي/كلي للإعدادات المسموحة فقط (upsert).
     */
    public function update(array $values): array
    {
        foreach ($values as $key => $value) {
            if (! array_key_exists($key, self::FIELDS)) {
                continue;
            }

            PlatformSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value === null ? null : json_encode($value)]
            );
        }

        return $this->all();
    }
}

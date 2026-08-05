<?php

namespace App\Support;

/**
 * أدوات مساعدة لروابط يوتيوب — كود عام مشترك بين الدومينات.
 *
 * الفيديوهات تُرفع على يوتيوب خارجيًا، ونخزّن رابطها في عمود video.
 * هذا الكلاس يستخرج معرّف الفيديو (ID) من أي صيغة رابط يوتيوب،
 * ويبني رابط التضمين الجاهز للعرض في iframe.
 */
class YouTubeUrl
{
    /**
     * استخراج معرّف الفيديو (ID) من رابط يوتيوب بأي صيغة مدعومة.
     * يدعم: watch?v= / youtu.be / shorts / embed / m.youtube.com.
     */
    public static function parseId(string $url): ?string
    {
        $parts = parse_url($url);

        if (! isset($parts['host'])) {
            return null;
        }

        $host = strtolower((string) $parts['host']);
        $isYouTube = str_ends_with($host, 'youtube.com') || str_ends_with($host, 'youtu.be');

        if (! $isYouTube) {
            return null;
        }

        // صيغة youtu.be/ID و youtube.com/shorts/ID و youtube.com/embed/ID
        if (isset($parts['path'])) {
            $segments = array_values(array_filter(explode('/', $parts['path']), fn ($s) => $s !== ''));
            $last = end($segments);

            if (is_string($last) && str_starts_with($host, 'youtu.be')) {
                return self::validId($last);
            }

            if (is_string($last) && ($last !== 'watch' && $last !== 'embed')) {
                return self::validId($last);
            }
        }

        // صيغة youtube.com/watch?v=ID
        if (isset($parts['query'])) {
            parse_str($parts['query'], $query);

            if (isset($query['v']) && is_string($query['v'])) {
                return self::validId($query['v']);
            }
        }

        return null;
    }

    /**
     * بناء رابط التضمين الجاهز للعرض من رابط يوتيوب.
     * يعيد null إن لم يكن الرابط يوتيوبًا صالحًا.
     */
    public static function embed(?string $url): ?string
    {
        if (! $url || $url === '') {
            return null;
        }

        $id = self::parseId($url);

        return $id ? "https://www.youtube-nocookie.com/embed/{$id}" : null;
    }

    /**
     * التحقق أن المعرّف صالح (11 حرفًا) قبل إرجاعه.
     */
    private static function validId(string $id): ?string
    {
        return preg_match('/^[\w-]{11}$/', $id) === 1 ? $id : null;
    }
}

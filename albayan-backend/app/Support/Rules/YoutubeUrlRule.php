<?php

namespace App\Support\Rules;

use App\Support\YouTubeUrl;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * قاعدة تحقق: الرابط يجب أن يكون رابط يوتيوب صالحًا.
 * يُستخدم في حقول video الخاصة بالدرس والفقرة.
 */
class YoutubeUrlRule implements ValidationRule
{
    /**
     * تشغيل قاعدة التحقق.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || YouTubeUrl::parseId($value) === null) {
            $fail('الرابط يجب أن يكون رابط يوتيوب صالحًا (youtube.com/watch أو youtu.be).');
        }
    }
}

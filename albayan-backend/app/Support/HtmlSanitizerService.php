<?php

namespace App\Support;

use Mews\Purifier\Facades\Purifier;

/**
 * خدمة تعقيم محتوى HTML القادم من محرر TipTap.
 *
 * تُستدعى قبل حفظ محتوى الفقرة في قاعدة البيانات، لضمان عدم تخزين
 * أكواد ضارة أو وسوم غير مسموحة — دفاع بطبقات حتى لو كان المُدخِل مشرفًا.
 */
class HtmlSanitizerService
{
    /**
     * تعقيم نص HTML وإرجاع نسخة آمنة منه.
     */
    public function sanitize(string $html): string
    {
        return Purifier::clean($html);
    }
}

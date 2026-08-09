<?php

namespace Database\Seeders\Data;

/**
 * فهرس المحتوى التعليمي — نقطة تجميع كل خطط الدروس (وحدات + دروس كاملة الرحلة).
 * تُستدعى من CourseSeeder (إنشاء الوحدات) و LessonSeeder (إنشاء الدروس والرحلات).
 */
class ContentCatalog
{
    /** كل خطط المحتوى: مرحلة رائدة → وحدات → دروس. */
    public static function plans(): array
    {
        return [
            ...ArabicPrimary::plans(),
            ...ArabicPreparatory::plans(),
            ...ArabicSecondary::plans(),
            ...SampleLessons::plans(),
            ...EnglishData::plans(),
            ...ScienceData::plans(),
            ...SocialStudiesData::plans(),
            ...ProfessionalSkillsData::plans(),
            ...ReligionData::plans(),
        ];
    }

    /**
     * مفتاح مطابقة خطة المقرر: "grade|semester|subject".
     */
    public static function planKey(string $grade, int $semester, string $subject): string
    {
        return $grade.'|'.$semester.'|'.$subject;
    }
}

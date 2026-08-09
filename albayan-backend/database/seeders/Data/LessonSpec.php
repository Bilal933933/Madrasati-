<?php

namespace Database\Seeders\Data;

/**
 * مساعدات بناء مواصفات الدروس — تبسّط توليد نصوص HTML الرحمة وقوالب الأسئلة
 * دون تكرار النمط نفسه في كل درس.
 */
class LessonSpec
{
    /** صور تجريبية (placeholder) موزعة بألوان متناسقة مع طابع المنصة. */
    public const IMG_ARABIC = 'https://placehold.co/800x450/FFF3E0/9A6700?text=اللغة-العربية';

    public const IMG_MATH = 'https://placehold.co/800x450/FDE68A/92400E?text=الرياضيات';

    public const IMG_SCIENCE = 'https://placehold.co/800x450/D1FAE5/065F46?text=العلوم';

    /** رابط Reel تجريبي (مقطوع قصير يوتيوب). */
    public const REEL = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';

    /** رابط فيديو شامل تجريبي (فيديو يوتيوب طويل). */
    public const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    /** ألوان المخططات الافتراضية لكل مادة — يطابق ألوان CurriculumData. */
    public const DIAGRAM_COLORS = [
        'اللغة العربية' => ['FFF3E0', '9A6700'],
        'الرياضيات' => ['FDE68A', '92400E'],
        'العلوم' => ['D1FAE5', '065F46'],
        'اللغة الإنجليزية' => ['CFFAFE', '155E75'],
        'الدراسات الاجتماعية' => ['F3E8FF', '6B21A8'],
        'المهارات المهنية' => ['E2E8F0', '334155'],
        'التربية الدينية' => ['ECFCCB', '3F6212'],
    ];

    /** مخطط توضيحي (صورة placeholder) يستخدم كصورة افتراضية لأي فقرة درس دون صورة صريحة. */
    public static function diagram(string $title, string $subject, array $colors = []): string
    {
        [$bg, $fg] = $colors !== []
            ? $colors
            : (self::DIAGRAM_COLORS[$subject] ?? ['E9D8FD', '7E22CE']);

        $text = str_replace(' ', '-', 'مخطط-'.$title);

        return "https://placehold.co/800x450/{$bg}/{$fg}?text={$text}";
    }

    /** اختيار من متعدد: نص السؤال + خيارات + فهرس الصواب + تفسير. */
    public static function mcq(string $q, array $options, int $answer, string $explanation = ''): array
    {
        return ['kind' => 'mcq', 'q' => $q, 'options' => $options, 'answer' => $answer, 'explanation' => $explanation];
    }

    /** صح/خطأ: نص السؤال + قيمة الصواب + تفسير. */
    public static function tf(string $q, bool $answer, string $explanation = ''): array
    {
        return ['kind' => 'true_false', 'q' => $q, 'answer' => $answer, 'explanation' => $explanation];
    }

    /** فقرة: عنوان + محتوى + تقييم تكويني اختياري + صورة اختيارية. */
    public static function paragraph(string $title, string $content, array $formative = [], ?string $image = null): array
    {
        return [
            'title' => $title,
            'content' => $content,
            'image' => $image,
            'formative' => $formative,
        ];
    }

    /**
     * بناء مستند TipTap (JSON) غني — يغطّي كتلة الفقرة بأكملها لضمان عرض مكتمل:
     * مقدمة (فقرة أو أكثر) + أمثلة قائمة نقطية + أمثلة مرقّمة + ملاحظة تذكير.
     * مع دعم تحديد (غامق) داخل أي نص.
     *
     * @param  string|string[]  $intro  فقرة نصية واحدة أو عدة فقرات
     * @param  string[]  $examples  أمثلة قائمة نقطية
     * @param  string[]  $ordered  أمثلة قائمة مرقّمة
     */
    public static function body(string|array $intro, array $examples = [], string $note = '', array $ordered = []): string
    {
        $content = [];

        foreach ((array) $intro as $paragraph) {
            $content[] = ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $paragraph]]];
        }

        if ($examples !== []) {
            $content[] = ['type' => 'bulletList', 'content' => self::listItems($examples)];
        }

        if ($ordered !== []) {
            $content[] = ['type' => 'orderedList', 'content' => self::listItems($ordered)];
        }

        if ($note !== '') {
            $content[] = [
                'type' => 'blockquote',
                'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $note]]]],
            ];
        }

        return json_encode(
            ['type' => 'doc', 'content' => $content],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        ) ?: '{"type":"doc","content":[]}';
    }

    /** يحوّل النصوص إلى عناصر listItem جاهزة لـ TipTap. */
    private static function listItems(array $texts): array
    {
        return array_map(
            fn (string $text) => [
                'type' => 'listItem',
                'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $text]]]],
            ],
            $texts
        );
    }
}

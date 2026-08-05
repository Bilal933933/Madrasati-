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

    /** اختيار من متعدد: نص السؤال + خيارات + فهرس الصواب + تفسير. */
    public static function mcq(string $q, array $options, int $answer, string $explanation = ''): array
    {
        return ['kind' => 'mcq', 'q' => $q, 'options' => $options, 'answer' => $answer, 'explanation' => $explanation];
    }

    /** صح/خطأ: نص السؤال + قيمة الصواب + تفسير. */
    public static function tf(string $q, bool $answer, string $explanation = ''): array
    {
        return ['kind' => 'tf', 'q' => $q, 'answer' => $answer, 'explanation' => $explanation];
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

    /** بناء نص فقرة منمّق (تعريف + أمثلة قائمة + ملاحظة) لضمان تماسك العرض. */
    public static function body(string $intro, array $examples = [], string $note = ''): string
    {
        $html = '<p>'.$intro.'</p>';

        if ($examples !== []) {
            $html .= '<h3>أمثلة توضيحية</h3><ul>';
            foreach ($examples as $example) {
                $html .= '<li>'.$example.'</li>';
            }
            $html .= '</ul>';
        }

        if ($note !== '') {
            $html .= '<p><strong>خُلاصة:</strong> '.$note.'</p>';
        }

        return $html;
    }
}

<?php

namespace Database\Seeders\Prep3\Data;

/**
 * الرياضيات — الصف الثالث الإعدادي — الفصل الدراسي الأول 2027.
 * الوحدات الأربع مع ملف درس مستقل لكل درس (مسار: Math/lessons/).
 */
class Math
{
    public static function plans(): array
    {
        return [
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الرياضيات',
                'unit' => 'الوحدة الأولى: الأعداد والعمليات عليها',
                'description' => 'قوانين الأسس: قوى القوى والمعادلات الأسية وتطبيقاتها في الحياة اليومية.',
                'lessons' => [
                    require __DIR__.'/Math/lessons/u1-d1-quwa-alquwa.php',
                    require __DIR__.'/Math/lessons/u1-d2-muadalat-asiya.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الرياضيات',
                'unit' => 'الوحدة الثانية: الجبر',
                'description' => 'الدالة التربيعية، الأصفار الحقيقية لدوال كثيرات الحدود، ودوال الكسور الجبرية النسبية وعملياتها.',
                'lessons' => [
                    require __DIR__.'/Math/lessons/u2-d1-dala-tarbiiya.php',
                    require __DIR__.'/Math/lessons/u2-d2-asfar-kathirat-hudud.php',
                    require __DIR__.'/Math/lessons/u2-d3-dawal-kusur-jabriya.php',
                    require __DIR__.'/Math/lessons/u2-d4-majal-mushtarak.php',
                    require __DIR__.'/Math/lessons/u2-d5-amaliyat-kusur-jabriya.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الرياضيات',
                'unit' => 'الوحدة الثالثة: الهندسة وحساب المثلثات',
                'description' => 'التشابه (المضلعات والمثلثات) والتمدد والنسب المثلثية والعلاقة بين ميلي المستقيمين ومعادلة الخط المستقيم.',
                'lessons' => [
                    require __DIR__.'/Math/lessons/u3-d1-tashabuh-mudallaat.php',
                    require __DIR__.'/Math/lessons/u3-d2-tashabuh-muthallathat.php',
                    require __DIR__.'/Math/lessons/u3-d3-tamaddud.php',
                    require __DIR__.'/Math/lessons/u3-d4-nisab-muthallathiya.php',
                    require __DIR__.'/Math/lessons/u3-d5-nisab-muthallathiya-khassa.php',
                    require __DIR__.'/Math/lessons/u3-d6-milan-mustaqimayn.php',
                    require __DIR__.'/Math/lessons/u3-d7-muadala-khat-mustaqim.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الرياضيات',
                'unit' => 'الوحدة الرابعة: الإحصاء',
                'description' => 'مقاييس التشتت وكيفية قياس انتشار البيانات حول المتوسط.',
                'lessons' => [
                    require __DIR__.'/Math/lessons/u4-d1-muqayis-tashatut.php',
                ],
            ],
        ];
    }
}

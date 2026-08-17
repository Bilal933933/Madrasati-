<?php

namespace Database\Seeders\Prep3\Data;

/**
 * العلوم — الصف الثالث الإعدادي — الفصل الدراسي الأول 2027.
 * الوحدات الأربع مع ملف درس مستقل لكل درس (مسار: Science/lessons/).
 */
class Science
{
    public static function plans(): array
    {
        return [
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'العلوم',
                'unit' => 'الوحدة الأولى: التفاعلات الكيميائية وآثارها البيئية',
                'description' => 'أنواع التفاعلات الكيميائية، تفاعلات الاحتراق والتلوث البيئي، والتدخين ومخاطره.',
                'lessons' => [
                    require __DIR__.'/Science/lessons/u1-d1-anwa-tafaaulat.php',
                    require __DIR__.'/Science/lessons/u1-d2-ihtiraq-talawuth.php',
                    require __DIR__.'/Science/lessons/u1-d3-tadkheem.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'العلوم',
                'unit' => 'الوحدة الثانية: الكهرباء والمغناطيسية',
                'description' => 'التيار الكهربي، الدوائر الكهربية، والقوى الكهربية والمغناطيسية.',
                'lessons' => [
                    require __DIR__.'/Science/lessons/u2-d1-tayar-kahrabai.php',
                    require __DIR__.'/Science/lessons/u2-d2-dawair-kahrabaiya.php',
                    require __DIR__.'/Science/lessons/u2-d3-quwa-kahrabaiya-mughnatisiya.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'العلوم',
                'unit' => 'الوحدة الثالثة: تنوع الصفات في الكائنات الحية',
                'description' => 'الوراثة وتنوع الصفات، والانتخاب الطبيعي والصناعي.',
                'lessons' => [
                    require __DIR__.'/Science/lessons/u3-d1-wiratha-tanawu-sifat.php',
                    require __DIR__.'/Science/lessons/u3-d2-intikhab-tabii-sinaai.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'العلوم',
                'unit' => 'الوحدة الرابعة: تاريخ كوكب الأرض',
                'description' => 'السجل الحفري والأزمنة الجيولوجية لتاريخ الأرض.',
                'lessons' => [
                    require __DIR__.'/Science/lessons/u4-d1-sijil-hafri.php',
                    require __DIR__.'/Science/lessons/u4-d2-azmina-julujiya.php',
                ],
            ],
        ];
    }
}

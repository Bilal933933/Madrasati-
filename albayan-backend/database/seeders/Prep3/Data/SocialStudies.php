<?php

namespace Database\Seeders\Prep3\Data;

/**
 * الدراسات الاجتماعية — الصف الثالث الإعدادي — الفصل الدراسي الأول 2027.
 * الوحدات الأربع مع ملف درس مستقل لكل درس (مسار: SocialStudies/lessons/).
 */
class SocialStudies
{
    public static function plans(): array
    {
        return [
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الدراسات الاجتماعية',
                'unit' => 'الوحدة الأولى: الملامح الطبيعية والحضارية لقارات العالم الجديد',
                'description' => 'موقع ومظاهر سطح قارات العالم الجديد، الحضارات القديمة في الأمريكتين، والكشوف الجغرافية.',
                'lessons' => [
                    require __DIR__.'/SocialStudies/lessons/u1-d1-mawqi-mazahir-sath.php',
                    require __DIR__.'/SocialStudies/lessons/u1-d2-hadarat-amrikiyayn.php',
                    require __DIR__.'/SocialStudies/lessons/u1-d3-kuchuf-jughrafiya.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الدراسات الاجتماعية',
                'unit' => 'الوحدة الثانية: مصر في عصر محمد علي وخلفائه',
                'description' => 'تولية محمد علي، بناء الدولة الحديثة، ومصر في عصر خلفائه.',
                'lessons' => [
                    require __DIR__.'/SocialStudies/lessons/u2-d1-muhammad-ali-tawlia.php',
                    require __DIR__.'/SocialStudies/lessons/u2-d2-muhammad-ali-dawla-haditha.php',
                    require __DIR__.'/SocialStudies/lessons/u2-d3-khulafa-muhammad-ali.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الدراسات الاجتماعية',
                'unit' => 'الوحدة الثالثة: النظم البيئية في قارات العالم الجديد',
                'description' => 'نظم الغابات والحشائش، النظم الصحراوية والمائية، والتغير المناخي.',
                'lessons' => [
                    require __DIR__.'/SocialStudies/lessons/u3-d1-nuzum-ghabat-hashayish.php',
                    require __DIR__.'/SocialStudies/lessons/u3-d2-nuzum-sahrawiya-maiya.php',
                    require __DIR__.'/SocialStudies/lessons/u3-d3-taghayyur-munakhi.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'الدراسات الاجتماعية',
                'unit' => 'الوحدة الرابعة: الحركة الوطنية في مواجهة الاحتلال البريطاني',
                'description' => 'الثورة العرابية وبداية الاحتلال، وكفاح الحركة الوطنية وبناء الوعي الوطني.',
                'lessons' => [
                    require __DIR__.'/SocialStudies/lessons/u4-d1-thawra-urabiya.php',
                    require __DIR__.'/SocialStudies/lessons/u4-d2-kifah-haraka-wataniya.php',
                ],
            ],
        ];
    }
}

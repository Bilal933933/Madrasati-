<?php

namespace Database\Seeders\Prep3\Data;

/**
 * اللغة العربية — الصف الثالث الإعدادي — الفصل الدراسي الأول 2027.
 * وحدات النصوص الثلاث (كتاب الوزارة) + مقرر النحو + مقرر الإملاء.
 * كل درس في ملف مستقل (مسار: Arabic/lessons/).
 */
class Arabic
{
    public static function plans(): array
    {
        return [
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'اللغة العربية',
                'unit' => 'الوحدة الأولى: قيم تحمي شبابنا',
                'description' => 'نصوص الاستماع والقراءة والشعر في الوحدة الأولى.',
                'lessons' => [
                    require __DIR__.'/Arabic/lessons/u1-d1-istimaa-adab-alwalidain.php',
                    require __DIR__.'/Arabic/lessons/u1-d2-qiraa-aghlamin-dhahab.php',
                    require __DIR__.'/Arabic/lessons/u1-d3-qiraa-sadaqa.php',
                    require __DIR__.'/Arabic/lessons/u1-d4-shir-tahiya-lilshabab.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'اللغة العربية',
                'unit' => 'الوحدة الثانية: نحو تفكير سليم',
                'description' => 'نصوص الاستماع والقراءة والشعر في الوحدة الثانية.',
                'lessons' => [
                    require __DIR__.'/Arabic/lessons/u2-d1-istimaa-thamrat-anniaam.php',
                    require __DIR__.'/Arabic/lessons/u2-d2-qiraa-afdhal-aniam.php',
                    require __DIR__.'/Arabic/lessons/u2-d3-qiraa-khayr-jalees.php',
                    require __DIR__.'/Arabic/lessons/u2-d4-shir-taj-al-fadail.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'اللغة العربية',
                'unit' => 'الوحدة الثالثة: أنا والمستقبل',
                'description' => 'نصوص الاستماع والقراءة والشعر في الوحدة الثالثة.',
                'lessons' => [
                    require __DIR__.'/Arabic/lessons/u3-d1-istimaa-binaa-almustaqbal.php',
                    require __DIR__.'/Arabic/lessons/u3-d2-qiraa-hirfatuka-bayna-yadayk.php',
                    require __DIR__.'/Arabic/lessons/u3-d3-qiraa-mustaqbal-misr-fil-ziraa.php',
                    require __DIR__.'/Arabic/lessons/u3-d4-shir-isnaa-biyadika-majdaka.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'اللغة العربية',
                'unit' => 'النحو',
                'description' => 'المشتقات: اسم الفاعل، اسم المفعول، صيغ المبالغة، اسم المكان، اسم الزمان، اسم الآلة.',
                'lessons' => [
                    require __DIR__.'/Arabic/lessons/nahw-1-ism-fail.php',
                    require __DIR__.'/Arabic/lessons/nahw-2-ism-mafool.php',
                    require __DIR__.'/Arabic/lessons/nahw-3-siyagh-mubalagha.php',
                    require __DIR__.'/Arabic/lessons/nahw-4-ism-makan.php',
                    require __DIR__.'/Arabic/lessons/nahw-5-ism-zaman.php',
                    require __DIR__.'/Arabic/lessons/nahw-6-ism-ala.php',
                ],
            ],
            [
                'grade' => 'prep_3',
                'semester' => 1,
                'subject' => 'اللغة العربية',
                'unit' => 'الإملاء',
                'description' => 'الألف اللينة وكتابة الهمزة في بداية الكلمة ووسطها ومتطرفة.',
                'lessons' => [
                    require __DIR__.'/Arabic/lessons/imlaa-1-alf-layyina.php',
                    require __DIR__.'/Arabic/lessons/imlaa-2-hamza-bidayat.php',
                    require __DIR__.'/Arabic/lessons/imlaa-3-hamza-wasat.php',
                    require __DIR__.'/Arabic/lessons/imlaa-4-hamza-mutarrafa.php',
                ],
            ],
        ];
    }
}

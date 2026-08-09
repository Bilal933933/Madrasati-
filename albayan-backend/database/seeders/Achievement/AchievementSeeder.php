<?php

namespace Database\Seeders\Achievement;

use App\Domains\Achievement\Models\Achievement;
use Illuminate\Database\Seeder;

/**
 * يبذر الأوسمة الافتراضية الست — المستفادة من خارطة الطريق
 * (docs/Lesson-Engine-Specification.md): أول درس، أول مقرر، أول اختبار،
 * أيام متتالية، 100 سؤال صحيح... (الواجهة تعرض ما هو نشط فقط).
 */
class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'key' => 'first-lesson',
                'metric' => 'lessons_completed',
                'threshold' => 1,
                'title' => 'الخطوة الأولى',
                'description' => 'أكملت أول درس لك على المنصة.',
                'icon' => 'Sprout',
                'sort_order' => 1,
            ],
            [
                'key' => 'first-course',
                'metric' => 'courses_completed',
                'threshold' => 1,
                'title' => 'بطل الوحدة',
                'description' => 'أتممت مقررًا كاملًا بجميع دروسه.',
                'icon' => 'Trophy',
                'sort_order' => 2,
            ],
            [
                'key' => 'first-exam',
                'metric' => 'exams_passed',
                'threshold' => 1,
                'title' => 'انتصار أول اختبار',
                'description' => 'اجتزت أول اختبار بنجاح.',
                'icon' => 'BadgeCheck',
                'sort_order' => 3,
            ],
            [
                'key' => 'ten-lessons',
                'metric' => 'lessons_completed',
                'threshold' => 10,
                'title' => 'متعلّم منظم',
                'description' => 'أكملت عشرة دروس على المنصة.',
                'icon' => 'BookOpen',
                'sort_order' => 4,
            ],
            [
                'key' => 'hundred-correct',
                'metric' => 'correct_answers',
                'threshold' => 100,
                'title' => 'دقة مئوية',
                'description' => 'أجبت عن مئة سؤال إجابة صحيحة في الاختبارات.',
                'icon' => 'Target',
                'sort_order' => 5,
            ],
            [
                'key' => 'three-day-streak',
                'metric' => 'streak_days',
                'threshold' => 3,
                'title' => 'مواظب ثلاثة أيام',
                'description' => 'تعلمت لثلاثة أيام متتالية.',
                'icon' => 'Flame',
                'sort_order' => 6,
            ],
        ];

        foreach ($achievements as $data) {
            Achievement::updateOrCreate(['key' => $data['key']], $data);
        }
    }
}

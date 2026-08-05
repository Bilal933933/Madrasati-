<?php

namespace Database\Seeders\Support;

/**
 * سجلّ الجلسة — يتشارك الحالة بين الـ Seeders أثناء الجول الواحد.
 *
 * لا يكتب في قاعدة البيانات؛ بل يربط ما أُنشئ عبر خدمات الدومين الرسمية
 * بما يحتاجه الـ Seeder التالي (مفاتيح المقررات، بيانات أسئلة الدروس، خيارات الأسئلة).
 */
class SeedRegistry
{
    /** @var array<string, int> مفتاح المرحلة => stage_id */
    public static array $stages = [];

    /** @var array<string, int> مفتاح الصف الرائد => grade_id */
    public static array $grades = [];

    /** @var array<string, int> "grade|semester|subject" => subject_id */
    public static array $subjects = [];

    /** @var array<string, int> "grade|semester|subject|unit" => course_id */
    public static array $courses = [];

    /** @var array<int, array> lesson_id => بيانات تقييمات الدرس ومواصفاته للـ AssessmentSeeder */
    public static array $lessons = [];

    /** @var array<int, array> question_id => ['options' => [...], 'correct' => int] لأسئلة الاختيار */
    public static array $questionOptions = [];
}

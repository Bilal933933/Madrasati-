<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * ترتيب البذر:
     * المستخدمون ← الهيكل الأكاديمي (مراحل/صفوف/فصول/مواد/مقررات)
     * ← الدروس ورحلاتها ← أسئلة التقييم ← ملف الطالب وتقدّمه
     * ← بنك أسئلة الامتحانات وتعريفاتها ومحاولة تجريبية
     * ← تعريفات الإنجازات (مستقلة عن تقدّم الطالب).
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            Curriculum\StageSeeder::class,
            Curriculum\GradeSeeder::class,
            Curriculum\SemesterSeeder::class,
            Curriculum\SubjectSeeder::class,
            Curriculum\CourseSeeder::class,
            Lesson\LessonSeeder::class,
            Assessment\AssessmentSeeder::class,
            Assessment\QuestionSeeder::class,
            StudentProfileSeeder::class,
            StudentProgressSeeder::class,
            Exam\BankQuestionSeeder::class,
            Exam\ExamBlueprintSeeder::class,
            Exam\DemoExamAttemptSeeder::class,
            Achievement\AchievementSeeder::class,
        ]);
    }
}

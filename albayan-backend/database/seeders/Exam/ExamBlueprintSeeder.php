<?php

namespace Database\Seeders\Exam;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Exam\Services\ExamBlueprintService;
use App\Domains\Lesson\Models\Lesson;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * يبذر تعريفات الامتحانات (Exam Blueprints) عبر ExamBlueprintService::create —
 * نقطة الإنشاء الرسمية التي تفرض النطاق الصارم لكل نوع امتحان.
 *
 * يسبقها إسناد الأرقام الشهرية (month_no) لدروس الصف الرائد الابتدائي:
 * - داخل كل مادة/فصل يُرقَّم المقرر (Course) بالترتيب 1..n ↔ شهر الوحدة.
 * - امتحانات الشهر (monthly) تعتمد هذا الترقيم لاستجلاب دروس نطاقها.
 *
 * النطاق التجريبي: الصف الرابع الابتدائي فقط — درس + وحدة + شهري + فصلي + شامل.
 */
class ExamBlueprintSeeder extends Seeder
{
    private const GRADE_KEY = 'primary_4';

    public function run(): void
    {
        $this->assignMonthNumbers();

        $blueprintService = app(ExamBlueprintService::class);

        $this->createLessonExams($blueprintService);
        $this->createUnitExams($blueprintService);
        $this->createMonthlyExams($blueprintService);
        $this->createSemesterExam($blueprintService);
        $this->createFullExam($blueprintService);
    }

    /* ------------------------------------------------------------------ */

    /**
     * توزيع month_no على دروس الصف الرائد:
     * لكل مادة في كل فصل تُرقَّم المقررات (الوحدات) بالترتيب 1..n → شهر الوحدة.
     */
    private function assignMonthNumbers(): void
    {
        $lessons = Lesson::query()
            ->whereHas('course.subject.grade', fn ($q) => $q->whereKey(SeedRegistry::$grades[self::GRADE_KEY]))
            ->with(['course' => fn ($q) => $q->orderBy('sort_order')])
            ->get();

        $monthByCourse = [];

        foreach ($lessons as $lesson) {
            $subjectId = $lesson->course->subject_id;

            if (! isset($monthByCourse[$subjectId])) {
                $courses = Course::where('subject_id', $subjectId)
                    ->orderBy('sort_order')
                    ->get();

                foreach ($courses as $index => $course) {
                    $monthByCourse[$subjectId][$course->id] = $index + 1;
                }
            }

            $lesson->forceFill(['month_no' => $monthByCourse[$subjectId][$lesson->course_id]])
                ->save();
        }
    }

    /* ------------------------------- دروس ------------------------------- */

    private function createLessonExams(ExamBlueprintService $blueprintService): void
    {
        foreach (['المبتدأ والخبر', 'الفاعل', 'الجملة الاسمية والجملة الفعلية'] as $title) {
            $lesson = $this->lessonByTitle($title);

            if ($lesson === null) {
                continue;
            }

            $blueprintService->create([
                'exam_type' => 'lesson',
                'title' => 'امتحان درس «'.$lesson->title.'»',
                'description' => 'اختبر فهمك لدرس '.$lesson->title.' بعد إتمام رحلته.',
                'lesson_id' => $lesson->id,
                'duration_minutes' => 30,
                'attempts_allowed' => 2,
                'easy_count' => 2,
                'medium_count' => 1,
                'hard_count' => 1,
                'pass_threshold_percent' => 60,
                'show_review_after_submit' => true,
                'is_active' => true,
            ]);
        }
    }

    /* ------------------------- وحدات (مقررات) ------------------------- */

    private function createUnitExams(ExamBlueprintService $blueprintService): void
    {
        // وحدة النحو (الصف الرابع الابتدائي).
        $nahw = $this->courseByKey('النحو');

        if ($nahw !== null) {
            $blueprintService->create([
                'exam_type' => 'unit',
                'title' => 'امتحان وحدة النحو',
                'description' => 'امتحان يغطي دروس النحو: قواعد الجملة الاسمية والفعلية.',
                'course_id' => $nahw->id,
                'duration_minutes' => 30,
                'attempts_allowed' => 2,
                'easy_count' => 3,
                'medium_count' => 2,
                'hard_count' => 1,
                'pass_threshold_percent' => 60,
                'show_review_after_submit' => true,
                'is_active' => true,
            ]);
        }

        // وحدة الرياضيات (الأعداد والعمليات).
        $math = $this->courseByKey('الأعداد والعمليات');

        if ($math !== null) {
            $blueprintService->create([
                'exam_type' => 'unit',
                'title' => 'امتحان وحدة الرياضيات: الأعداد والعمليات',
                'description' => 'امتحان يغطي عمليات الجمع والطرح ومقارنة الأعداد.',
                'course_id' => $math->id,
                'duration_minutes' => 30,
                'attempts_allowed' => 2,
                'easy_count' => 2,
                'medium_count' => 1,
                'hard_count' => 1,
                'pass_threshold_percent' => 60,
                'show_review_after_submit' => true,
                'is_active' => true,
            ]);
        }
    }

    /* ------------------------- أشهر (monthly) ------------------------- */

    private function createMonthlyExams(ExamBlueprintService $blueprintService): void
    {
        $arabic = SeedRegistry::$subjects[self::GRADE_KEY.'|1|اللغة العربية'] ?? null;

        if ($arabic === null) {
            return;
        }

        // شهر أول مفتوح (وحدة النحو أُكملت) + شهر ثانِ مغلق (يُظهر التقدّم).
        $blueprintService->create([
            'exam_type' => 'monthly',
            'title' => 'امتحان الشهر الأول — اللغة العربية',
            'description' => 'امتحان شهري لأسابيع الشهر الأول في مادة اللغة العربية.',
            'subject_id' => $arabic,
            'month_no' => 1,
            'duration_minutes' => 30,
            'attempts_allowed' => 2,
            'easy_count' => 3,
            'medium_count' => 2,
            'hard_count' => 1,
            'pass_threshold_percent' => 60,
            'show_review_after_submit' => true,
            'is_active' => true,
        ]);

        $blueprintService->create([
            'exam_type' => 'monthly',
            'title' => 'امتحان الشهر الثاني — اللغة العربية',
            'description' => 'امتحان شهري لدروس الشهر الثاني من مادة اللغة العربية.',
            'subject_id' => $arabic,
            'month_no' => 2,
            'duration_minutes' => 30,
            'attempts_allowed' => 2,
            'easy_count' => 3,
            'medium_count' => 2,
            'hard_count' => 1,
            'pass_threshold_percent' => 60,
            'show_review_after_submit' => true,
            'is_active' => true,
        ]);
    }

    /* ------------------------- فصلي (semester) ------------------------- */

    private function createSemesterExam(ExamBlueprintService $blueprintService): void
    {
        $arabic = SeedRegistry::$subjects[self::GRADE_KEY.'|1|اللغة العربية'] ?? null;

        if ($arabic === null) {
            return;
        }

        $blueprintService->create([
            'exam_type' => 'semester',
            'title' => 'امتحان الفصل الدراسي الأول — اللغة العربية',
            'description' => 'امتحان شامل لدروس الفصل الدراسي الأول في اللغة العربية.',
            'subject_id' => $arabic,
            'duration_minutes' => 60,
            'attempts_allowed' => 2,
            'easy_count' => 4,
            'medium_count' => 3,
            'hard_count' => 2,
            'pass_threshold_percent' => 60,
            'show_review_after_submit' => true,
            'is_active' => true,
        ]);
    }

    /* ------------------------- شامل (full) ------------------------- */

    private function createFullExam(ExamBlueprintService $blueprintService): void
    {
        $gradeId = SeedRegistry::$grades[self::GRADE_KEY] ?? null;

        if ($gradeId === null) {
            return;
        }

        $blueprintService->create([
            'exam_type' => 'full',
            'title' => 'الامتحان الشامل — الصف الرابع الابتدائي',
            'description' => 'امتحان شامل لجميع مواد الصف الرابع الابتدائي.',
            'grade_id' => $gradeId,
            'duration_minutes' => 60,
            'attempts_allowed' => 1,
            'easy_count' => 4,
            'medium_count' => 3,
            'hard_count' => 2,
            'pass_threshold_percent' => 60,
            'show_review_after_submit' => true,
            'is_active' => true,
        ]);
    }

    /* ------------------------ أدوات مساعدة ------------------------ */

    private function lessonByTitle(string $title): ?Lesson
    {
        return Lesson::query()
            ->where('title', $title)
            ->whereHas('course.subject.grade', fn ($q) => $q->whereKey(SeedRegistry::$grades[self::GRADE_KEY]))
            ->first();
    }

    private function courseByKey(string $unit): ?Course
    {
        $courseId = SeedRegistry::$courses[self::GRADE_KEY.'|1|اللغة العربية|'.$unit]
            ?? SeedRegistry::$courses[self::GRADE_KEY.'|1|الرياضيات|'.$unit]
            ?? null;

        return $courseId !== null ? Course::find($courseId) : null;
    }
}
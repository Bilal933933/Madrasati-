<?php

namespace Database\Seeders\Exam;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Exam\Services\ExamBlueprintService;
use App\Domains\Lesson\Models\Lesson;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

/**
 * يبذر تعريفات الامتحانات (Exam Blueprints) عبر ExamBlueprintService::create —
 * نقطة الإنشاء الرسمية التي تفرض النطاق الصارم لكل نوع امتحان.
 *
 * يسبقها إسناد الأرقام الشهرية (month_no) لدروس الصف الرائد الابتدائي:
 * - داخل كل مادة/فصل يُرقَّم المقرر (Course) بالترتيب 1..n ↔ شهر الوحدة.
 * - امتحانات الشهر (monthly) تعتمد هذا الترقيم لاستجلاب دروس نطاقها.
 *
 * النطاق: الصف الرابع الابتدائي — امتحان لكل درس وكل وحدة وكل شهر،
 * + فصلي لكل مادة، + شامل للصف.
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
        $this->createSemesterExams($blueprintService);
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

    /* --------------------------- دروس الصف --------------------------- */

    private function subjects(): Collection
    {
        return Subject::query()
            ->where('grade_id', SeedRegistry::$grades[self::GRADE_KEY])
            ->get();
    }

    /* ------------------------------- دروس ------------------------------- */

    private function createLessonExams(ExamBlueprintService $blueprintService): void
    {
        $lessons = Lesson::query()
            ->whereHas('course.subject.grade', fn ($q) => $q->whereKey(SeedRegistry::$grades[self::GRADE_KEY]))
            ->orderBy('sort_order')
            ->limit(60)
            ->get();

        foreach ($lessons as $lesson) {
            $blueprintService->create([
                'exam_type' => 'lesson',
                'title' => 'امتحان درس «'.$lesson->title.'»',
                'description' => 'اختبر فهمك لدرس '.$lesson->title.'.',
                'lesson_id' => $lesson->id,
                'duration_minutes' => 30,
                'attempts_allowed' => 2,
                'easy_count' => 2,
                'medium_count' => 1,
                'hard_count' => 1,
                'pass_threshold_percent' => 60,
                'show_review_after_submit' => true,
                'is_active' => true,
                'requires_completion' => false,
            ]);
        }
    }

    /* ------------------------- وحدات (مقررات) ------------------------- */

    private function createUnitExams(ExamBlueprintService $blueprintService): void
    {
        $courses = Course::whereIn(
            'subject_id',
            $this->subjects()->pluck('id')->all()
        )->get();

        foreach ($courses as $course) {
            $blueprintService->create([
                'exam_type' => 'unit',
                'title' => 'امتحان وحدة '.$course->name,
                'description' => 'امتحان يغطي دروس وحدة «'.$course->name.'».',
                'course_id' => $course->id,
                'duration_minutes' => 30,
                'attempts_allowed' => 2,
                'easy_count' => 3,
                'medium_count' => 2,
                'hard_count' => 1,
                'pass_threshold_percent' => 60,
                'show_review_after_submit' => true,
                'is_active' => true,
                'requires_completion' => false,
            ]);
        }
    }

    /* ------------------------- أشهر (monthly) ------------------------- */

    private function createMonthlyExams(ExamBlueprintService $blueprintService): void
    {
        foreach ($this->subjects() as $subject) {
            $courseMonths = Course::where('subject_id', $subject->id)
                ->orderBy('sort_order')
                ->get()
                ->count();

            for ($month = 1; $month <= $courseMonths; $month++) {
                $blueprintService->create([
                    'exam_type' => 'monthly',
                    'title' => 'امتحان الشهر '.$this->monthLabel($month).' — '.$subject->name,
                    'description' => 'امتحان شهري لدروس الشهر '.$this->monthLabel($month).' من مادة '.$subject->name.'.',
                    'subject_id' => $subject->id,
                    'month_no' => $month,
                    'duration_minutes' => 30,
                    'attempts_allowed' => 2,
                    'easy_count' => 3,
                    'medium_count' => 2,
                    'hard_count' => 1,
                    'pass_threshold_percent' => 60,
                    'show_review_after_submit' => true,
                    'is_active' => true,
                    'requires_completion' => false,
                ]);
            }
        }
    }

    private function monthLabel(int $month): string
    {
        return match ($month) {
            1 => 'الأول',
            2 => 'الثاني',
            3 => 'الثالث',
            4 => 'الرابع',
            default => (string) $month,
        };
    }

    /* ------------------------- فصلي (semester) ------------------------- */

    private function createSemesterExams(ExamBlueprintService $blueprintService): void
    {
        foreach ($this->subjects() as $subject) {
            $blueprintService->create([
                'exam_type' => 'semester',
                'title' => 'امتحان الفصل الدراسي الأول — '.$subject->name,
                'description' => 'امتحان شامل لدروس الفصل الدراسي الأول في مادة '.$subject->name.'.',
                'subject_id' => $subject->id,
                'duration_minutes' => 60,
                'attempts_allowed' => 2,
                'easy_count' => 4,
                'medium_count' => 3,
                'hard_count' => 2,
                'pass_threshold_percent' => 60,
                'show_review_after_submit' => true,
                'is_active' => true,
                'requires_completion' => false,
            ]);
        }
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
            'requires_completion' => false,
        ]);
    }
}

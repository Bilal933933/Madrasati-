<?php

namespace Database\Seeders\Curriculum;

use App\Domains\Curriculum\Models\Subject;
use App\Domains\Curriculum\Services\CurriculumService;
use Database\Seeders\Data\ContentCatalog;
use Database\Seeders\Data\CurriculumData;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(CurriculumService::class);
        $flagship = CurriculumData::flagshipGrades(); // مفتاح الصف => اسم الصف

        // تجميع خطط الوحدات بمفتاحها: "grade|semester|subject" => [خطط...]
        $unitsByKey = [];
        foreach (ContentCatalog::plans() as $plan) {
            $unitsByKey[ContentCatalog::planKey($plan['grade'], $plan['semester'], $plan['subject'])][] = $plan;
        }

        foreach (Subject::with(['grade', 'semester'])->get() as $subject) {
            $gradeKey = array_search($subject->grade->name, $flagship, true);
            $semesterIndex = $subject->semester ? ($subject->semester->sort_order + 1) : 1;
            $planKey = $gradeKey !== false
                ? ContentCatalog::planKey($gradeKey, $semesterIndex, $subject->name)
                : null;

            // اللغة العربية في الصفوف الرائدة → وحدات حقيقية (النحو/النصوص/الإملاء/البلاغة/...).
            if ($planKey !== null && isset($unitsByKey[$planKey])) {
                foreach ($unitsByKey[$planKey] as $plan) {
                    $this->createCourse($service, $subject, $plan['unit'], $plan['description'], $planKey);
                }

                continue;
            }

            // بقية المواد/الصفوف → وحدات عامة ليكتمل شكل الشجرة.
            $unitName = $semesterIndex === 1 ? 'الوحدة الأولى' : 'الوحدة الثانية';
            $description = 'محتوى '.$subject->name.' للفصل '
                .($semesterIndex === 1 ? 'الدراسي الأول' : 'الدراسي الثاني')
                .' — المفاهيم الأساسية وتطبيقاتها.';
            $this->createCourse($service, $subject, $unitName, $description, $planKey);
        }
    }

    private function createCourse(CurriculumService $service, Subject $subject, string $name, string $description, ?string $planKey): void
    {
        $course = $service->createCourse([
            'subject_id' => $subject->id,
            'name' => $name,
            'description' => $description,
            'icon' => $subject->icon,
            'color' => $subject->color,
            'sort_order' => $service->nextCourseOrder($subject->id),
            'is_published' => true,
        ]);

        if ($planKey !== null) {
            SeedRegistry::$courses[$planKey.'|'.$name] = $course->id;
        }
    }
}

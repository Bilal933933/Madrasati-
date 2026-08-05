<?php

namespace Database\Seeders\Curriculum;

use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Services\CurriculumService;
use Database\Seeders\Data\CurriculumData;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(CurriculumService::class);
        $flagship = CurriculumData::flagshipGrades(); // مفتاح الصف => اسم الصف

        foreach (CurriculumData::subjectsByStage() as $stageKey => $subjects) {
            $stage = Stage::findOrFail(SeedRegistry::$stages[$stageKey]);

            foreach ($stage->grades as $grade) {
                $gradeKey = array_search($grade->name, $flagship, true);

                foreach ($grade->semesters as $semester) {
                    foreach ($subjects as $index => $subjectData) {
                        $subject = $service->createSubject([
                            'grade_id' => $grade->id,
                            'semester_id' => $semester->id,
                            'name' => $subjectData['name'],
                            'icon' => $subjectData['icon'],
                            'color' => $subjectData['color'],
                            'sort_order' => $index,
                            'is_published' => true,
                        ]);

                        if ($gradeKey !== false) {
                            $semesterIndex = $semester->sort_order + 1; // 1 = الأول، 2 = الثاني
                            SeedRegistry::$subjects[$gradeKey.'|'.$semesterIndex.'|'.$subjectData['name']] = $subject->id;
                        }
                    }
                }
            }
        }
    }
}

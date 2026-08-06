<?php

namespace Database\Seeders\Curriculum;

use App\Domains\Curriculum\Services\CurriculumService;
use Database\Seeders\Data\CurriculumData;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(CurriculumService::class);
        $flagship = CurriculumData::flagshipGrades(); // مفتاح الصف => اسم الصف
        $iconsByStage = CurriculumData::gradeIconsByStage(); // مفتاح المرحلة => أيقونات الصفوف

        foreach (CurriculumData::gradesByStage() as $stageKey => $grades) {
            $stageId = SeedRegistry::$stages[$stageKey];
            $icons = $iconsByStage[$stageKey] ?? [];

            foreach ($grades as $index => $gradeName) {
                $grade = $service->createGrade([
                    'stage_id' => $stageId,
                    'key' => 'grade-'.($index + 1),
                    'name' => $gradeName,
                    'icon' => $icons[$index] ?? null,
                    'sort_order' => $index,
                    'is_published' => true,
                ]);

                $key = array_search($gradeName, $flagship, true);
                if ($key !== false) {
                    SeedRegistry::$grades[$key] = $grade->id;
                }
            }
        }
    }
}

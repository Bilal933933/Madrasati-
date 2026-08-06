<?php

namespace Database\Seeders\Curriculum;

use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Services\CurriculumService;
use Database\Seeders\Data\CurriculumData;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(CurriculumService::class);

        foreach (Grade::all() as $grade) {
            foreach (CurriculumData::SEMESTER_NAMES as $index => $name) {
                $service->createSemester([
                    'grade_id' => $grade->id,
                    'key' => 'semester-'.($index + 1),
                    'name' => $name,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}

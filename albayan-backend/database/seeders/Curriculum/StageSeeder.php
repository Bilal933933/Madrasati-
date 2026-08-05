<?php

namespace Database\Seeders\Curriculum;

use App\Domains\Curriculum\Services\CurriculumService;
use Database\Seeders\Data\CurriculumData;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

class StageSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(CurriculumService::class);

        foreach (CurriculumData::stages() as $index => $stage) {
            $model = $service->createStage([
                'name' => $stage['name'],
                'icon' => $stage['icon'],
                'color' => $stage['color'],
                'sort_order' => $index,
                'is_published' => true,
            ]);

            SeedRegistry::$stages[$stage['key']] = $model->id;
        }
    }
}

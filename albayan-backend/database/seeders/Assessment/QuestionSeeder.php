<?php

namespace Database\Seeders\Assessment;

use App\Domains\Assessment\Services\AssessmentService;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * يضيف خيارات أسئلة الاختيار من متعدد (mcq) عبر AssessmentService::createOption.
 */
class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $assessmentService = app(AssessmentService::class);

        foreach (SeedRegistry::$questionOptions as $questionId => $data) {
            foreach ($data['options'] as $order => $option) {
                $assessmentService->createOption([
                    'question_id' => $questionId,
                    'content' => $option,
                    'is_correct' => $order === $data['correct'],
                    'sort_order' => $order,
                ]);
            }
        }
    }
}

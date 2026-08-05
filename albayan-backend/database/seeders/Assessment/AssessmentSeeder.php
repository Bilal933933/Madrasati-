<?php

namespace Database\Seeders\Assessment;

use App\Domains\Assessment\Services\AssessmentService;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * يضيف أسئلة كل درس (قبلي/تكويني/نهائي) إلى تقييماته عبر AssessmentService::createQuestion.
 * لا يُنشئ التقييمات نفسها؛ فهي أُنشئت ضمن رحلة الدرس في LessonSeeder عبر المحرر الرسمي.
 */
class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $assessmentService = app(AssessmentService::class);

        foreach (SeedRegistry::$lessons as $lessonMeta) {
            $spec = $lessonMeta['spec'];

            $this->addQuestions($assessmentService, $lessonMeta['pre'], $spec['pre'] ?? []);

            foreach ($spec['paragraphs'] as $index => $paragraph) {
                $formative = $paragraph['formative'] ?? [];
                if ($formative === [] || ! isset($lessonMeta['formatives'][$index])) {
                    continue;
                }

                $this->addQuestions($assessmentService, $lessonMeta['formatives'][$index], $formative);
            }

            $this->addQuestions($assessmentService, $lessonMeta['final'], $spec['final'] ?? []);
        }
    }

    private function addQuestions(AssessmentService $service, int $assessmentId, array $questions): void
    {
        foreach ($questions as $order => $question) {
            $model = $service->createQuestion([
                'assessment_id' => $assessmentId,
                'type' => $question['kind'],
                'content' => $question['q'],
                'explanation' => $question['explanation'] ?? null,
                'correct_answer' => $question['kind'] === 'tf' ? $question['answer'] : null,
                'sort_order' => $order,
            ]);

            // خيارات أسئلة الاختيار تُبنى لاحقًا في QuestionSeeder.
            if ($question['kind'] === 'mcq') {
                SeedRegistry::$questionOptions[$model->id] = [
                    'options' => $question['options'],
                    'correct' => $question['answer'],
                ];
            }
        }
    }
}

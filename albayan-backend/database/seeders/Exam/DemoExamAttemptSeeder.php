<?php

namespace Database\Seeders\Exam;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamAttemptQuestion;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Exam\Services\ExamAttemptService;
use Illuminate\Database\Seeder;

/**
 * ينشئ محاولة تجريبية مكتملة للطالب (student@example.com) على امتحان درس
 * «المبتدأ والخبر» — مفتوح بالفعل لأن الطالب أكمل دروس النحو كاملة.
 *
 * تُسجَّل عبر سير المحاولات الرسمي (ExamAttemptService::start → answer → submit)
 * فتُظهر في واجهة الطالب النتيجة والمراجعة فورًا. الإجابات: الغالبية صحيحة
 * مع خطأ واحد لتكون النتيجة واقعية.
 */
class DemoExamAttemptSeeder extends Seeder
{
    public function run(): void
    {
        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            ['name' => 'طالب تجريبي', 'password' => 'password'],
        );

        $blueprint = ExamBlueprint::query()
            ->where('exam_type', 'lesson')
            ->where('title', 'امتحان درس «المبتدأ والخبر»')
            ->first();

        if ($blueprint === null || ! $blueprint->is_active) {
            return;
        }

        $attemptService = app(ExamAttemptService::class);

        try {
            $attempt = $attemptService->start($student, $blueprint);
        } catch (\Throwable) {
            // نطاق غير مفتوح أو لا أسئلة — نتجاوز بهدوء دون إيقاف البذر.
            return;
        }

        foreach ($attempt->questions->values() as $index => $question) {
            $this->answerQuestion($attemptService, $attempt, $question, $index);
        }

        $attemptService->submit($attempt);
    }

    /**
     * يحاكي إجابة الطالب: الأغلبية صحيحة، وخطأ واحد (آخر سؤال تقريبًا).
     */
    private function answerQuestion(ExamAttemptService $service, $attempt, ExamAttemptQuestion $question, int $index): void
    {
        $snapshot = $question->question_snapshot;
        $wrong = $index % 4 === 0;

        if (($snapshot['type'] ?? null) === 'true_false') {
            $service->answer($attempt, $question, [
                'selected_boolean' => $wrong ? ! $snapshot['correct_boolean'] : $snapshot['correct_boolean'],
            ]);

            return;
        }

        $options = $snapshot['options'] ?? [];
        $correctId = $snapshot['correct_option_id'] ?? null;

        $chosen = $wrong
            ? collect($options)->firstWhere('is_correct', false)['id'] ?? null
            : $correctId;

        $service->answer($attempt, $question, ['selected_option_id' => $chosen]);
    }
}
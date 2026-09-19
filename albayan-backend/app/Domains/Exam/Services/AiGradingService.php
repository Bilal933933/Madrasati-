<?php

namespace App\Domains\Exam\Services;

use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamAttemptQuestion;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * خدمة استدعاء خدمة التصحيح الذكي (NestJS) من Laravel.
 * - ترسل دفعة أسئلة نصية وتستقبل نتائج منظمة.
 * - تتعامل مع المهلة الزمنية والأخطاء بشكل دفاعي.
 * - تعيد مصفوفة نتائج متوافقة مع ExamAttemptQuestion.
 */
class AiGradingService
{
    private string $baseUrl;

    private string $serviceKey;

    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.ai_grading.url', env('AI_GRADING_URL', 'http://localhost:3001'));
        $this->serviceKey = config('services.ai_grading.key', env('AI_SERVICE_KEY', ''));
        $this->timeout = (int) config('services.ai_grading.timeout', env('AI_GRADING_TIMEOUT_MS', 30000));
    }

    /**
     * تصحيح دفعة أسئلة نصية عبر استدعاء NestJS.
     *
     * @param  ExamAttemptQuestion[]  $questions
     * @return array<int, array{question_id: int, correct: bool, score: float, ai_grade: array}>
     */
    public function gradeMultiple(array $questions, ExamAttempt $attempt): array
    {
        if (empty($questions)) {
            return [];
        }

        $payload = [
            'questions' => array_map(fn (ExamAttemptQuestion $q) => $this->buildQuestionPayload($q, $attempt), $questions),
        ];

        $context = $this->buildBatchContext($attempt);
        if ($context !== null) {
            $payload['context'] = $context;
        }

        try {
            $response = Http::timeout($this->timeout / 1000)
                ->withHeaders([
                    'x-ai-service-key' => $this->serviceKey,
                    'Accept' => 'application/json',
                ])
                ->post("{$this->baseUrl}/api/exam/grade", $payload);

            if (! $response->successful()) {
                Log::error('AI grading service returned error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'attempt_id' => $attempt->id,
                ]);

                return $this->failedResults($questions, 'AI service error: '.$response->status());
            }

            $data = $response->json();

            return $this->mapResults($questions, $data['results'] ?? []);
        } catch (\Throwable $e) {
            Log::error('AI grading request failed', [
                'error' => $e->getMessage(),
                'attempt_id' => $attempt->id,
                'questions_count' => count($questions),
            ]);

            return $this->failedResults($questions, $e->getMessage());
        }
    }

    /**
     * بناء حمولة سؤال واحد للـ NestJS.
     */
    private function buildQuestionPayload(ExamAttemptQuestion $question, ExamAttempt $attempt): array
    {
        $snapshot = $question->question_snapshot;
        $type = $snapshot['type'] ?? 'short_answer';

        $payload = [
            'questionId' => $question->id,
            'type' => $type,
            'question' => $snapshot['content'] ?? '',
            'studentAnswer' => $question->selected_text ?? '',
            'modelAnswer' => $snapshot['model_answer'] ?? null,
        ];

        // حقول خاصة بكل نوع
        if ($type === 'short_answer') {
            $payload['acceptedAnswers'] = $snapshot['accepted_answers'] ?? [];
            $payload['caseSensitive'] = $snapshot['case_sensitive'] ?? false;
        } elseif ($type === 'essay') {
            $payload['criteria'] = $snapshot['rubric'] ?? [
                ['criterion' => 'الدقة العلمية'],
                ['criterion' => 'الاكتمال واتباع مفردات السؤال'],
                ['criterion' => 'التنظيم والوضوح'],
            ];
        } elseif ($type === 'numeric') {
            $payload['correctValue'] = $snapshot['correct_value'] ?? null;
            $payload['tolerance'] = $snapshot['tolerance'] ?? 0;
            $payload['units'] = $snapshot['units'] ?? null;
        }

        // سياق السؤال الخاص (اختياري)
        if (! empty($snapshot['context'])) {
            $payload['context'] = $snapshot['context'];
        }

        return array_filter($payload, fn ($v) => $v !== null && $v !== []);
    }

    /**
     * بناء سياق الدفعة (نص المنهج المستخلص).
     */
    private function buildBatchContext(ExamAttempt $attempt): ?array
    {
        // يمكن توسيع هذا مستقبلاً لجلب سياق من الدروس المرتبطة
        return null;
    }

    /**
     * تحويل نتائج الـ NestJS إلى مصفوفة متوافقة مع الحفظ.
     *
     * @param  ExamAttemptQuestion[]  $questions
     * @param  array<int, array>  $rawResults
     * @return array<int, array{question_id: int, correct: bool, score: float, ai_grade: array}>
     */
    private function mapResults(array $questions, array $rawResults): array
    {
        $resultsById = [];
        foreach ($rawResults as $result) {
            $resultsById[$result['questionId'] ?? $result['question_id'] ?? 0] = $result;
        }

        $mapped = [];
        foreach ($questions as $question) {
            $raw = $resultsById[$question->id] ?? null;

            if (! $raw) {
                $mapped[] = [
                    'question_id' => $question->id,
                    'correct' => false,
                    'score' => 0.0,
                    'ai_grade' => [
                        'status' => 'error',
                        'feedback' => 'لم تُستقبل نتيجة من خدمة التصحيح.',
                    ],
                ];

                continue;
            }

            $aiGrade = $raw['aiGrade'] ?? $raw['ai_grade'] ?? [];

            // العقد: NestJS يعيد score فقط؛ correct قرار تعليمي يُشتق هنا
            // (صريح من المساعد إن وُجد، وإلا عتبة 50% للمقالي عبر score_percent).
            $correct = isset($raw['correct'])
                ? (bool) $raw['correct']
                : (isset($aiGrade['correct'])
                    ? (bool) $aiGrade['correct']
                    : (isset($aiGrade['score_percent'])
                        ? ((float) $aiGrade['score_percent'] >= 50.0)
                        : (((float) ($raw['score'] ?? 0)) >= 0.5)));

            $mapped[] = [
                'question_id' => $question->id,
                'correct' => $correct,
                'score' => (float) ($raw['score'] ?? 0.0),
                'ai_grade' => $aiGrade,
            ];
        }

        return $mapped;
    }

    /**
     * نتائج فاشلة افتراضية (pending_manual) عند تعذر الاتصال.
     *
     * @param  ExamAttemptQuestion[]  $questions
     * @return array<int, array{question_id: int, correct: bool, score: float, ai_grade: array}>
     */
    private function failedResults(array $questions, string $error): array
    {
        return array_map(fn (ExamAttemptQuestion $q) => [
            'question_id' => $q->id,
            'correct' => false,
            'score' => null,
            'ai_grade' => [
                'status' => 'pending_manual',
                'feedback' => 'تعذر التصحيح الآلي: '.$error.'. سيتم مراجعة إجابتك يدويًا.',
            ],
        ], $questions);
    }
}

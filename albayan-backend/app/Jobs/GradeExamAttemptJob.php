<?php

namespace App\Jobs;

use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Services\ExamAttemptService;
use App\Domains\Exam\Services\ExamGradingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Job لتصحيح الأسئلة الذكية (short_answer/essay/numeric) بشكل غير متزامن.
 * يُستدعى بعد تسليم المحاولة (submit) أو انتهاء الوقت (autoExpire).
 */
class GradeExamAttemptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [60, 300, 900]; // 1د، 5د، 15د بين المحاولات

    public function __construct(
        private int $attemptId,
    ) {}

    public function handle(
        ExamAttemptService $attemptService,
        ExamGradingService $gradingService,
    ): void {
        $attempt = ExamAttempt::with('questions', 'blueprint')->find($this->attemptId);

        if (! $attempt) {
            Log::error('GradeExamAttemptJob: Attempt not found', ['attempt_id' => $this->attemptId]);

            return;
        }

        // إذا كانت المحاولة في حالة غير متوقعة، لا نتابع
        if (! in_array($attempt->attempt_status, ['submitted', 'in_progress'], true)) {
            Log::warning('GradeExamAttemptJob: Unexpected attempt status', [
                'attempt_id' => $this->attemptId,
                'status' => $attempt->attempt_status,
            ]);

            return;
        }

        try {
            // تحديث الحالة إلى grading (اختياري للـ debugging)
            $attempt->update(['grading_errors' => null]);

            // إكمال التصحيح (يستدعي AiGradingService للأسئلة الذكية)
            $attemptService->completeGrading($attempt);

            Log::info('GradeExamAttemptJob: Grading completed', [
                'attempt_id' => $this->attemptId,
                'total_score' => $attempt->fresh()->total_score,
                'percentage' => $attempt->fresh()->percentage,
            ]);
        } catch (Throwable $e) {
            Log::error('GradeExamAttemptJob: Grading failed', [
                'attempt_id' => $this->attemptId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $attempt->update([
                'attempt_status' => 'graded', // ننهي الحالة حتى لا يعلق الفرونت
                'graded_at' => now(),
                'grading_errors' => $e->getMessage(),
            ]);

            // إعادة رمي الخطأ لتفعيل retry mechanism
            throw $e;
        }
    }

    /**
     * إذا فشل الـ Job نهائياً بعد كل المحاولات.
     */
    public function failed(Throwable $exception): void
    {
        $attempt = ExamAttempt::find($this->attemptId);

        if ($attempt) {
            $attempt->update([
                'attempt_status' => 'graded',
                'graded_at' => now(),
                'grading_errors' => 'فشل التصحيح بعد عدة محاولات: '.$exception->getMessage(),
            ]);

            Log::critical('GradeExamAttemptJob: Permanently failed', [
                'attempt_id' => $this->attemptId,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}

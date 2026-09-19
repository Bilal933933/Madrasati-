<?php

namespace App\Domains\Exam\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Events\ExamCompletedEvent;
use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Models\ExamAttemptQuestion;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Exam\Models\ExamProgress;
use App\Jobs\GradeExamAttemptJob;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\ValidationException;

/**
 * دورة حياة محاولة الامتحان: البدء → الإجابة → التسليم/الانتهاء التلقائي.
 */
class ExamAttemptService
{
    public function __construct(
        private readonly ExamBlueprintService $scopeService,
        private readonly ExamUnlockService $unlockService,
        private readonly ExamGeneratorService $generatorService,
        private readonly ExamGradingService $gradingService,
    ) {}

    /**
     * بدء محاولة جديدة: التحقق من الفتح + الحدود ثم التوليد واللقطات.
     */
    public function start(User $user, ExamBlueprint $blueprint): ExamAttempt
    {
        if (! $blueprint->is_active) {
            throw ValidationException::withMessages(['blueprint_id' => 'هذا الامتحان غير متاح حاليًا.']);
        }

        if (! $this->unlockService->isUnlocked($user, $blueprint)) {
            throw ValidationException::withMessages(['blueprint_id' => 'أكمل جميع دروس النطاق أولًا لفتح هذا الامتحان.']);
        }

        $existing = ExamAttempt::query()
            ->where('blueprint_id', $blueprint->id)
            ->ownedBy($user)
            ->inProgress()
            ->first();

        if ($existing) {
            // محاولة سابقة انتهى أجلها ولم تُسلّم — تُسجَّل آليًا كمحاولة منتهية
            if ($existing->isExpired()) {
                $this->finalizeExpiredAttempt($existing);
            } else {
                throw ValidationException::withMessages(['blueprint_id' => 'لديك محاولة جارية لهذا الامتحان — أكملها أو سلمها أولًا.']);
            }
        }

        // يُحسب العدد بعد إنهاء المحاولات المنتهية آليًا — حتى لا يتحوّل الجاري المنتهي إلى محاولة إضافية خاطئة
        $completedAttempts = ExamAttempt::query()
            ->where('blueprint_id', $blueprint->id)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereIn('attempt_status', ['graded', 'submitted'])
            ->count();

        if ($completedAttempts >= $blueprint->attempts_allowed) {
            throw ValidationException::withMessages(['blueprint_id' => 'استنفدت عدد المحاولات المسموح لهذا الامتحان.']);
        }

        $questions = $this->generatorService->selectQuestions($blueprint, $this->scopeService);

        if ($questions->isEmpty()) {
            throw ValidationException::withMessages(['blueprint_id' => 'لا توجد أسئلة متاحة لإنشاء هذا الامتحان.']);
        }

        $now = Carbon::now();
        $attemptNumber = $completedAttempts + 1;

        $attempt = $this->createAttemptTransaction($user, $blueprint, $questions, $attemptNumber, $now);

        return $attempt->load(['blueprint', 'questions']);
    }

    /**
     * حفظ إجابة سؤال في محاولة جارية.
     */
    public function answer(ExamAttempt $attempt, ExamAttemptQuestion $question, array $data): ExamAttemptQuestion
    {
        $this->assertCanAnswer($attempt);

        $question->selected_option_id = $data['selected_option_id'] ?? null;
        $question->selected_boolean = $data['selected_boolean'] ?? null;
        $question->selected_text = $data['selected_text'] ?? null;
        $question->save();

        return $question->fresh();
    }

    /**
     * حفظ تقدم المحاولة (الموضع الحالي + الأسئلة المعلَّمة) — upsert بصف واحد لكل محاولة.
     */
    public function syncProgress(ExamAttempt $attempt, array $data): ExamProgress
    {
        $this->assertCanAnswer($attempt);

        $progress = ExamProgress::query()->firstOrNew([
            'user_id' => $attempt->user_id,
            'exam_attempt_id' => $attempt->id,
        ]);

        $progress->current_index = $data['current_index'] ?? 0;
        $progress->flagged_question_ids = $data['flagged_question_ids'] ?? [];
        $progress->save();

        return $progress;
    }

    /**
     * تسليم المحاولة:
     * 1) تصحيح فوري للأسئلة الحتمية (mcq/true_false).
     * 2) تغيير الحالة إلى submitted وقفل المحاولة.
     * 3) بعث Job للتصحيح غير المتزامن للأسئلة الذكية.
     * 4) إرجاع المحاولة مع الأوسمة المفتوحة (للتصحيح المتزامن).
     */
    public function submit(ExamAttempt $attempt): ExamAttempt
    {
        if (! $attempt->isInProgress()) {
            throw ValidationException::withMessages(['attempt_id' => 'هذه المحاولة لم تعد قابلة للتسليم.']);
        }

        // 1) تصحيح فوري للأسئلة الحتمية
        $this->gradingService->gradeDeterministicQuestions($attempt);

        // 2) قفل المحاولة وتحديث الحالة
        $attempt->update([
            'status' => 'completed',
            'attempt_status' => 'submitted',
            'submitted_at' => now(),
            'is_locked' => true,
        ]);

        // 3) إذا وجدت أسئلة ذكية، بعتها Job للتصحيح غير المتزامن
        if ($this->gradingService->hasAiQuestions($attempt)) {
            GradeExamAttemptJob::dispatch($attempt->id)
                ->onQueue('grading');

            // للأسئلة الذكية: لا توجد أوسمة فورية، يُعيد المحاولة كما هي
            return $attempt->fresh();
        }

        // لا توجد أسئلة ذكية — نكمل التصحيح فوراً وننشر الحدث
        $this->completeGradingAndDispatchEvent($attempt);

        // نعيد نفس المحاولة (ليست fresh) لأن الأوسمة مُعيّنة عليها
        return $attempt;
    }

    /**
     * إكمال التصحيح ونشر حدث ExamCompleted (للأسئلة الحتمية فقط أو عند انتهاء Job).
     */
    public function completeGrading(ExamAttempt $attempt): ExamAttempt
    {
        $this->gradingService->grade($attempt);

        $event = new ExamCompletedEvent($attempt->user, $attempt);
        Event::dispatch($event);

        return $attempt->fresh();
    }

    /**
     * إكمال التصحيح ونشر الحدث مع التقاط الأوسمة المفتوحة (للرد الفوري في التسليم).
     */
    public function completeGradingAndDispatchEvent(ExamAttempt $attempt): ExamCompletedEvent
    {
        $this->gradingService->grade($attempt);

        $event = new ExamCompletedEvent($attempt->user, $attempt);
        Event::dispatch($event);

        // تعيين الأوسمة المفتوحة على المحاولة للرد الفوري
        $attempt->unlocked_achievements = $event->unlocked;

        return $event;
    }

    /**
     * الانتهاء التلقائي بمؤقت الخادم: إنهاء محاولات انتهى أجلها ولم تُسلّم.
     */
    public function autoExpire(): int
    {
        $expired = ExamAttempt::query()
            ->inProgress()
            ->expired()
            ->get();

        $count = 0;

        foreach ($expired as $attempt) {
            if (! $attempt->isInProgress()) {
                continue;
            }

            $this->finalizeExpiredAttempt($attempt);
            $count++;
        }

        return $count;
    }

    /* ------------------------------------------------------------------ */

    /**
     * التصحيح النهائي لمحاولة انتهت مدتها دون تسليم.
     */
    private function finalizeExpiredAttempt(ExamAttempt $attempt): void
    {
        // تصحيح الحتمية
        $this->gradingService->gradeDeterministicQuestions($attempt);

        $attempt->update([
            'status' => 'completed',
            'attempt_status' => 'submitted',
            'submitted_at' => now(),
            'is_locked' => true,
        ]);

        if ($this->gradingService->hasAiQuestions($attempt)) {
            GradeExamAttemptJob::dispatch($attempt->id)
                ->onQueue('grading');
        } else {
            $this->completeGradingAndDispatchEvent($attempt);
        }
    }

    /**
     * التحقق من إمكانية الإجابة.
     */
    private function assertCanAnswer(ExamAttempt $attempt): void
    {
        if (! $attempt->isInProgress()) {
            throw ValidationException::withMessages(['attempt_id' => 'هذه المحاولة ليست قيد التقدم.']);
        }

        if ($attempt->isExpired()) {
            $this->finalizeExpiredAttempt($attempt);
            throw ValidationException::withMessages([
                'attempt_id' => 'انتهى وقت الامتحان، تم تصحيح إجاباتك تلقائيًا.',
                'redirect_to' => $attempt->fresh()->id,
            ]);
        }
    }

    /**
     * إنشاء المحاولة واللقطات داخل معاملة واحدة.
     */
    private function createAttemptTransaction(User $user, ExamBlueprint $blueprint, $questions, int $attemptNumber, Carbon $now): ExamAttempt
    {
        return DB::transaction(function () use ($user, $blueprint, $questions, $attemptNumber, $now) {
            $attempt = ExamAttempt::create([
                'blueprint_id' => $blueprint->id,
                'user_id' => $user->id,
                'attempt_number' => $attemptNumber,
                'status' => 'in_progress',
                'attempt_status' => 'in_progress',
                'started_at' => $now,
                'deadline_at' => $now->copy()->addMinutes($blueprint->duration_minutes),
                'total_questions' => $questions->count(),
            ]);

            foreach ($questions->values() as $index => $question) {
                ExamAttemptQuestion::create([
                    'exam_attempt_id' => $attempt->id,
                    'bank_question_id' => $question->id,
                    'question_snapshot' => $this->generatorService->buildSnapshot($question),
                    'sort_order' => $index + 1,
                ]);
            }

            return $attempt;
        });
    }
}

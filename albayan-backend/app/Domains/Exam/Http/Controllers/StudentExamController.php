<?php

namespace App\Domains\Exam\Http\Controllers;

use App\Domains\Exam\Http\Resources\ExamAttemptDetailResource;
use App\Domains\Exam\Http\Resources\ExamAttemptResource;
use App\Domains\Exam\Http\Resources\ExamBlueprintResource;
use App\Domains\Exam\Models\BankQuestionOption;
use App\Domains\Exam\Models\ExamAttempt;
use App\Domains\Exam\Services\ExamAttemptService;
use App\Domains\Exam\Services\ExamBlueprintService;
use App\Domains\Exam\Services\ExamUnlockService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * مسارات الطالب: قائمة الامتحانات، فتح النطاق، الأداء، التسليم، المراجعة.
 */
class StudentExamController extends Controller
{
    public function __construct(
        private readonly ExamBlueprintService $blueprintService,
        private readonly ExamUnlockService $unlockService,
        private readonly ExamAttemptService $attemptService,
    ) {}

    /**
     * الامتحانات المتاحة للطالب (نشطة فقط) مع حالة الفتح والتقدّم.
     */
    public function index()
    {
        $blueprints = $this->blueprintService->blueprints(null, activeOnly: true);

        return ExamBlueprintResource::collection(
            $blueprints->map(function ($blueprint) {
                $progress = $this->unlockService->progress(auth()->user(), $blueprint);

                $blueprint->unlock_progress = $progress;

                return $blueprint;
            })
        );
    }

    /**
     * تفاصيل امتحان + حالة الفتح + سجل محاولات الطالب.
     */
    public function show(Request $request, int $id)
    {
        $blueprint = $this->blueprintService->findBlueprint($id);
        $user = $request->user();

        $blueprint->unlock_progress = $this->unlockService->progress($user, $blueprint);
        $blueprint->setAttribute('attempts_left', $this->attemptsLeft($blueprint, $user));
        $blueprint->setAttribute('best_score', $this->bestScore($blueprint, $user));

        return new ExamBlueprintResource($blueprint);
    }

    /**
     * سجل محاولات الطالب على امتحان.
     */
    public function myAttempts(Request $request, int $id)
    {
        $blueprint = $this->blueprintService->findBlueprint($id);

        $attempts = $blueprint->attempts()
            ->where('user_id', $request->user()->id)
            ->with('blueprint')
            ->orderByDesc('attempt_number')
            ->get();

        return ExamAttemptResource::collection($attempts);
    }

    /**
     * بدء محاولة جديدة.
     */
    public function start(Request $request, int $id)
    {
        $blueprint = $this->blueprintService->findBlueprint($id);
        $attempt = $this->attemptService->start($request->user(), $blueprint);

        return response()->json([
            'data' => new ExamAttemptDetailResource($attempt, revealAnswers: false),
            'message' => 'بدأت المحاولة. بالتوفيق!',
        ], 201);
    }

    /**
     * تفاصيل محاولة (أثناء الأداء أو المراجعة حسب الإذن بالكشف).
     */
    public function showAttempt(Request $request, int $attemptId)
    {
        $attempt = $this->findOwnAttempt($request, $attemptId);
        $reveal = $attempt->status === 'completed'
            && $attempt->blueprint->show_review_after_submit;

        return new ExamAttemptDetailResource($attempt->load(['questions', 'progress']), revealAnswers: $reveal);
    }

    /**
     * حفظ إجابة سؤال في محاولة جارية.
     */
    public function saveAnswer(Request $request, int $attemptId, int $questionId)
    {
        $attempt = $this->findOwnAttempt($request, $attemptId);

        $question = $attempt->questions()
            ->whereKey($questionId)
            ->firstOrFail();

        $validated = $request->validate([
            'selected_option_id' => ['nullable', 'integer', 'exists:bank_question_options,id'],
            'selected_boolean' => ['nullable', 'boolean'],
        ]);

        // التحقق من أن الخيار يخصّ سؤال البنك المأخوذ في اللقطة
        $this->assertOptionBelongsToQuestion($question, $validated);

        $saved = $this->attemptService->answer($attempt, $question, $validated);

        return response()->json([
            'data' => [
                'question_id' => $saved->id,
                'selected_option_id' => $saved->selected_option_id,
                'selected_boolean' => $saved->selected_boolean,
            ],
            'message' => 'تم حفظ الإجابة.',
        ]);
    }

    /**
     * حفظ تقدم المحاولة (الموضع الحالي + الأسئلة المعلَّمة).
     */
    public function syncProgress(Request $request, int $attemptId)
    {
        $attempt = $this->findOwnAttempt($request, $attemptId);

        $validated = $request->validate([
            'current_index' => ['required', 'integer', 'min:0'],
            'flagged_question_ids' => ['present', 'array'],
            'flagged_question_ids.*' => ['integer'],
        ]);

        $questionIds = $attempt->questions()->pluck('id')->all();

        $flagged = array_values(array_unique(array_map('intval', $validated['flagged_question_ids'])));
        $outOfRange = array_diff($flagged, $questionIds);

        if ($outOfRange !== []) {
            throw ValidationException::withMessages([
                'flagged_question_ids' => 'إحدى الأسئلة المعلَّمة لا تخصّ هذه المحاولة.',
            ]);
        }

        if ($validated['current_index'] >= $attempt->total_questions) {
            throw ValidationException::withMessages([
                'current_index' => 'موضع السؤال خارج نطاق أسئلة المحاولة.',
            ]);
        }

        $progress = $this->attemptService->syncProgress($attempt, [
            'current_index' => (int) $validated['current_index'],
            'flagged_question_ids' => $flagged,
        ]);

        return response()->json([
            'data' => [
                'current_index' => $progress->current_index,
                'flagged_question_ids' => $progress->flagged_question_ids,
            ],
            'message' => 'تم حفظ التقدم.',
        ]);
    }

    /**
     * تسليم المحاولة نهائيًا مع التصحيح الفوري.
     */
    public function submit(Request $request, int $attemptId)
    {
        $attempt = $this->findOwnAttempt($request, $attemptId);

        $attempt = $this->attemptService->submit($attempt);

        return response()->json([
            'data' => new ExamAttemptResource($attempt->load('blueprint')),
            'message' => 'تم تسليم المحاولة بنجاح.',
        ]);
    }

    /* ------------------------------------------------------------------ */

    private function findOwnAttempt(Request $request, int $attemptId): ExamAttempt
    {
        $attempt = ExamAttempt::query()
            ->with('blueprint')
            ->findOrFail($attemptId);

        if ($attempt->user_id !== $request->user()->id) {
            throw ValidationException::withMessages(['attempt_id' => 'لا يمكنك الوصول إلى محاولة طالب آخر.']);
        }

        return $attempt;
    }

    private function assertOptionBelongsToQuestion($question, array $validated): void
    {
        if (($validated['selected_option_id'] ?? null) === null) {
            return;
        }

        $bankQuestionId = $question->bank_question_id;

        $exists = BankQuestionOption::query()
            ->where('id', $validated['selected_option_id'])
            ->where('bank_question_id', $bankQuestionId)
            ->exists();

        if (! $exists) {
            throw ValidationException::withMessages([
                'selected_option_id' => 'الخيار المحدد لا يخصّ هذا السؤال.',
            ]);
        }
    }

    private function attemptsLeft($blueprint, $user): int
    {
        $completed = $blueprint->attempts()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        return max(0, $blueprint->attempts_allowed - $completed);
    }

    private function bestScore($blueprint, $user): ?float
    {
        return $blueprint->attempts()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->max('score_percentage');
    }
}

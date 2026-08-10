import { useEffect, useMemo, useRef } from "react";
import { useAttemptGuard } from "./useAttemptGuard";
import { useAttemptAnswers } from "./useAttemptAnswers";
import { useAttemptNavigation } from "./useAttemptNavigation";
import { useAttemptProgressSync } from "./useAttemptProgressSync";
import { useAttemptSubmission } from "./useAttemptSubmission";
import { useAttemptTimer } from "./useAttemptTimer";
import type { ExamAttemptDetail } from "../types/attempt.types";

/**
 * محرك المحاولة (متكيّف من مرجع al-bayan-exam-platform لموديلنا المسطّح).
 *
 * زارّع خفيف يجمع الـ hooks الفرعية ويوفّر واجهة موحّدة ثابتة:
 * - الإجابات (useAttemptAnswers) — النسخة المحلية + الإرسال الفوري.
 * - التنقل (useAttemptNavigation) — الموضع + الحفظ المحلي للاستئناف.
 * - المزامنة (useAttemptProgressSync) — العلم والموضع → الباك بـ debounce.
 * - التسليم (useAttemptSubmission) + المؤقت (useAttemptTimer) — تسليم آلي عند انتهاء الوقت.
 *
 * الحارس (submittedRef) يُنشأ هنا كمرجع وحيد ويُشارك بين الـ hooks لضمان
 * اتخاذ قرار التسليم مرة واحدة.
 */
export function useAttemptEngine(
  attempt: ExamAttemptDetail,
  onSubmitted: () => void
) {
  const attemptId = attempt.id;
  const questions = useMemo(() => attempt.questions, [attempt]);

  const guard = useAttemptGuard(attemptId, onSubmitted);

  const {
    answers,
    selectOption,
    selectBoolean,
    answeredCount,
    isSaving,
  } = useAttemptAnswers(attempt, guard);

  const {
    currentIndex,
    goToNext,
    goToPrevious,
    jumpTo,
    isFirstQuestion,
    isLastQuestion,
  } = useAttemptNavigation(attemptId, questions.length, attempt.current_index);

  const { flagged, toggleFlag } = useAttemptProgressSync(
    attempt,
    currentIndex,
    guard
  );

  const { submit, isSubmitting } = useAttemptSubmission(
    attemptId,
    guard,
    onSubmitted
  );

  // مرجع بأحدث دالة تسليم حتى يستخدمه المؤقت دون كسر إغلاقات التأثير
  const submitRef = useRef<() => void>(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // المؤقت — يسلّم تلقائيًا عند انتهاء الوقت مرة واحدة، ويسلّم فورًا لو فُتحت الصفحة بعد الموعد
  const remainingSeconds = useAttemptTimer(attempt, guard, submitRef);

  const currentQuestion = questions[currentIndex] ?? null;

  return {
    questions,
    currentQuestion,
    currentIndex,
    goToNext,
    goToPrevious,
    jumpTo,
    isFirstQuestion,
    isLastQuestion,
    selectOption,
    selectBoolean,
    toggleFlag,
    flagged,
    answers,
    answeredCount,
    totalQuestions: questions.length,
    progressPercent:
      questions.length > 0
        ? Math.round((answeredCount / questions.length) * 100)
        : 0,
    remainingSeconds,
    isSubmitting,
    isSaving,
    submit,
  };
}
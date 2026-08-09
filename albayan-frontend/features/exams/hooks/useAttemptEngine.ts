import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage, isApiError } from "@/lib/apiErrors";
import { notifyUnlockedAchievements } from "@/features/achievements/lib/achievementUnlocks";
import { studentExamsApi } from "../services/studentExamsApi";
import { useExamProgressStore } from "../state/examProgressStore";
import type { ExamAnswerValue } from "../types/progress.types";
import type {
  ExamAttemptDetail,
  SaveAnswerPayload,
  SaveProgressPayload,
} from "../types/attempt.types";

function isAnswered(value: ExamAnswerValue | undefined): boolean {
  return value != null && (value.optionId != null || value.booleanValue != null);
}

function toPayload(value: ExamAnswerValue): SaveAnswerPayload {
  return {
    selected_option_id: value.optionId,
    selected_boolean: value.booleanValue,
  };
}

function flaggedRecordsToIds(flagged: Record<number, boolean>): number[] {
  return Object.entries(flagged)
    .filter(([, value]) => value === true)
    .map(([key]) => Number(key));
}

/** قيم إجابة الخادم (المحفوظة في المحاولة) بصيغة منضبطة. */
function seedWebServerAnswers(attempt: ExamAttemptDetail): Record<number, ExamAnswerValue> {
  const map: Record<number, ExamAnswerValue> = {};

  for (const q of attempt.questions) {
    if (q.selected_option_id != null || q.selected_boolean != null) {
      map[q.id] = {
        optionId: q.selected_option_id,
        booleanValue: q.selected_boolean,
      };
    }
  }

  return map;
}

function isEmptyValue(v?: ExamAnswerValue): boolean {
  return v == null || (v.optionId == null && v.booleanValue == null);
}

/**
 * هل خطأ الباك يحمل إشارة توجيه للنتيجة؟ (انتهى وقت الامتحان وصُححت الإجابات تلقائيًا)
 * الباك يبثّ `redirect_to` في errors عند إنهاء محاولة منتهية.
 */
function expiryRedirectId(error: unknown): number | null {
  if (!isApiError(error)) return null;
  const raw = error.errors?.redirect_to?.[0];
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function sameValue(a: ExamAnswerValue, b?: ExamAnswerValue): boolean {
  if (isEmptyValue(a) && isEmptyValue(b)) return true;
  return a.optionId === b?.optionId && a.booleanValue === b?.booleanValue;
}

/**
 * دمج إجابات الباك (رسمية) مع النسخة المحلية (أحدث نية للطالب).
 * كل إجابة محلية مختلفة عن الخادم تُضاف إلى قائمة بانتظار الإرسال.
 */
function computeMerge(
  server: Record<number, ExamAnswerValue>,
  local: Record<number, ExamAnswerValue>
): { answers: Record<number, ExamAnswerValue>; pending: number[] } {
  const answers: Record<number, ExamAnswerValue> = { ...server };
  const pending: number[] = [];

  for (const [key, localValue] of Object.entries(local)) {
    const qid = Number(key);
    answers[qid] = localValue;
    if (!sameValue(localValue, server[qid])) {
      pending.push(qid);
    }
  }

  return { answers, pending };
}

function calcRemaining(attempt: ExamAttemptDetail): number {
  if (!attempt.deadline_at) return 0;
  return Math.max(
    0,
    Math.floor((new Date(attempt.deadline_at).getTime() - Date.now()) / 1000)
  );
}

/**
 * محرك المحاولة (متكيّف من مرجع al-bayan-exam-platform لموديلنا المسطّح).
 *
 * - يُركَّب فقط عند توفر بيانات محاولة جاهزة (ثبات الهوية لكل محاولة).
 * - الحالة المحلية هي مصدر العرض، وتُنسخ كل لحظة في مخزن تقدم محلي
 *   (Zustand + persist) لضمان استئناف سلس عند تحديث الصفحة.
 * - كل اختيار يُرسل فورًا إلى الباك (PUT)؛ إجابات غير المحفوظة تُعاد محاولتها
 *   تلقائيًا عند العودة إلى الصفحة حتى يُسلَّم الباك.
 * - المؤقت من deadline_at يسلّم آليًا مرة واحدة عند انتهاء الوقت.
 */
export function useAttemptEngine(
  attempt: ExamAttemptDetail,
  onSubmitted: () => void
) {
  const queryClient = useQueryClient();
  const attemptId = attempt.id;
  const questions = useMemo(() => attempt.questions, [attempt]);

  // تهيئة الحالة من الإجابات الرسمية موقّعة بالنسخة المحلية (المخزنة).
  const [answers, setAnswers] = useState<Record<number, ExamAnswerValue>>(
    () => {
      const entry = useExamProgressStore.getState().getEntry(attemptId);
      return computeMerge(seedWebServerAnswers(attempt), entry?.answers ?? {})
        .answers;
    }
  );

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const entry = useExamProgressStore.getState().getEntry(attemptId);
    // التقدم الرسمي من الباك، مع تفضيل النسخة المحلية الأحدث (أوفلاين أو شبه إرسال).
    return entry?.index ?? attempt.current_index ?? 0;
  });

  const [flagged, setFlagged] = useState<Record<number, boolean>>(() => {
    const entry = useExamProgressStore.getState().getEntry(attemptId);
    const serverFlags: Record<number, boolean> = Object.fromEntries(
      (attempt.flagged_question_ids ?? []).map((id) => [id, true])
    );
    // دمج علامات الباك مع النسخة المحلية — المحلية هي نية الطالب الأحدث.
    return { ...serverFlags, ...(entry?.flagged ?? {}) };
  });

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calcRemaining(attempt)
  );

  const submittedRef = useRef(false);

  // انتهى وقت المحاولة في الباك — نوجّه للنتيجة وننظّف التقدم المحلي (مرة واحدة فقط).
  const handleExpiryRedirect = (error: unknown): boolean => {
    if (submittedRef.current) return true;
    if (expiryRedirectId(error) == null) return false;

    submittedRef.current = true;
    useExamProgressStore.getState().clearAttempt(attemptId);
    toast.info("انتهى وقت الامتحان، تم تصحيح إجاباتك تلقائيًا.");
    onSubmitted();
    return true;
  };

  const saveAnswer = useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: number;
      payload: SaveAnswerPayload;
    }) => studentExamsApi.saveAnswer(attemptId, questionId, payload),
    onSuccess: (_data, variables) => {
      useExamProgressStore
        .getState()
        .markSynced(attemptId, variables.questionId, true);
    },
    onError: (error) => {
      if (handleExpiryRedirect(error)) return;
      toast.error(getErrorMessage(error, "تعذّر حفظ الإجابة. إعادة المحاولة لاحقًا."));
    },
  });

  // دمج + بذر + إعادة محاولة الإجابات المعلقة عند كل فتح للمحاولة
  const retriedRef = useRef(false);
  useEffect(() => {
    const store = useExamProgressStore.getState();
    const entry = store.getEntry(attemptId);
    const server = seedWebServerAnswers(attempt);
    const merged = computeMerge(server, entry?.answers ?? {});

    store.seed(attemptId, merged.answers, merged.pending);

    if (!retriedRef.current) {
      retriedRef.current = true;
      for (const qid of merged.pending) {
        saveAnswer.mutate({
          questionId: qid,
          payload: toPayload(
            merged.answers[qid] ?? { optionId: null, booleanValue: null }
          ),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // حفظ الموضع الحالي محليًا عند كل نقلة — النسخة المحلية من وعي المستخدم
  useEffect(() => {
    useExamProgressStore.getState().setIndex(attemptId, currentIndex);
  }, [attemptId, currentIndex]);

  // مزامنة تقدم المحاولة (الموضع + العلامات) مع الباك — debounced لألا تُثقَل الشبكة.
  const saveProgress = useMutation({
    mutationFn: (payload: SaveProgressPayload) =>
      studentExamsApi.saveProgress(attemptId, payload),
    onError: (error) => {
      if (handleExpiryRedirect(error)) return;
      toast.error(getErrorMessage(error, "تعذّر حفظ التقدم. سيُعاد عند التغيير التالي."));
    },
  });

  const flaggedIds = useMemo(
    () => flaggedRecordsToIds(flagged),
    [flagged]
  );

  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (submittedRef.current) return;

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      if (submittedRef.current) return;
      saveProgress.mutate({
        current_index: currentIndex,
        flagged_question_ids: flaggedIds,
      });
    }, 800);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, flaggedIds]);

  // تفريغ آخر مزامنة حال مغادرة الصفحة.
  const latestProgressRef = useRef<SaveProgressPayload>({
    current_index: currentIndex,
    flagged_question_ids: flaggedIds,
  });

  useEffect(() => {
    latestProgressRef.current = {
      current_index: currentIndex,
      flagged_question_ids: flaggedIds,
    };
  });

  useEffect(() => {
    return () => {
      if (submittedRef.current) return;
      studentExamsApi
        .saveProgress(attemptId, latestProgressRef.current)
        .catch(() => {});
    };
  }, [attemptId]);

  const submitAttempt = useMutation({
    mutationFn: () => studentExamsApi.submitAttempt(attemptId),
    onSuccess: (data) => {
      useExamProgressStore.getState().clearAttempt(attemptId);
      toast.success(data?.message ?? "تم تسليم المحاولة بنجاح.");
      notifyUnlockedAchievements(data?.unlocked_achievements);
      onSubmitted();
    },
    onError: (error) => {
      // قد تكون المحاولة أُنهيت تلقائيًا عند انتهاء الوقت — نعيد الجلب لنرى الحالة.
      if (handleExpiryRedirect(error)) return;
      toast.error(getErrorMessage(error, "تعذّرت تسليم المحاولة."));
      submittedRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["exam-attempt", attemptId] });
    },
  });

  /** تحديث الإجابة محليًا + إرسالها للباك وعلامتها كمتأخرة الإرسال مؤقتًا. */
  const commitAnswer = useCallback(
    (questionId: number, value: ExamAnswerValue) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      useExamProgressStore.getState().setAnswer(attemptId, questionId, value);
      saveAnswer.mutate({ questionId, payload: toPayload(value) });
    },
    [attemptId, saveAnswer]
  );

  const selectOption = useCallback(
    (questionId: number, optionId: number) => {
      const current = answers[questionId];
      const isCleared = !current || (current.optionId == null && current.booleanValue == null);

      if (!isCleared && current.optionId === optionId) {
        commitAnswer(questionId, { optionId: null, booleanValue: null });
      } else {
        commitAnswer(questionId, { optionId, booleanValue: null });
      }
    },
    [answers, commitAnswer]
  );

  const selectBoolean = useCallback(
    (questionId: number, value: boolean) => {
      const current = answers[questionId];
      const isCleared = !current || (current.optionId == null && current.booleanValue == null);

      if (!isCleared && current.booleanValue === value) {
        commitAnswer(questionId, { optionId: null, booleanValue: null });
      } else {
        commitAnswer(questionId, { optionId: null, booleanValue: value });
      }
    },
    [answers, commitAnswer]
  );

  const toggleFlag = useCallback(
    (questionId: number) => {
      setFlagged((prev) => {
        const next = { ...prev, [questionId]: !(prev[questionId] ?? false) };
        useExamProgressStore.getState().setFlag(attemptId, questionId, next[questionId]);
        return next;
      });
    },
    [attemptId]
  );

  const submit = useCallback(() => {
    if (submittedRef.current || submitAttempt.isPending) return;
    submittedRef.current = true;
    submitAttempt.mutate();
  }, [submitAttempt]);

  // مرجع بأحدث دالة تسليم حتى يستخدمه المؤقت دون كسر إغلاقات التأثير
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // المؤقت — يسلّم تلقائيًا عند انتهاء الوقت مرة واحدة، ويسلّم فورًا لو فُتحت الصفحة بعد الموعد
  useEffect(() => {
    if (!attempt.deadline_at) return;

    const deadline = new Date(attempt.deadline_at).getTime();
    if (deadline - Date.now() <= 0) {
      if (!submittedRef.current) submitRef.current();
      return;
    }

    const tick = () => {
      const r = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemainingSeconds(r);

      if (r <= 0 && !submittedRef.current) {
        submitRef.current();
      }
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [attemptId, attempt.deadline_at]);

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(answers[q.id])).length,
    [questions, answers]
  );

  const currentQuestion = questions[currentIndex] ?? null;

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
  }, [questions.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const jumpTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

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
    isSubmitting: submitAttempt.isPending,
    isSaving: saveAnswer.isPending,
    submit,
  };
}
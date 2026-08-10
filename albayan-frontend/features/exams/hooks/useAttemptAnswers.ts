import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { studentExamsApi } from "../services/studentExamsApi";
import { useExamProgressStore } from "../state/examProgressStore";
import {
  computeMerge,
  isAnswered,
  seedWebServerAnswers,
  toPayload,
} from "../lib/attempt-utils";
import type { ExamAnswerValue } from "../types/progress.types";
import type {
  ExamAttemptDetail,
  SaveAnswerPayload,
} from "../types/attempt.types";
import type { AttemptGuard } from "./useAttemptGuard";

/**
 * إجابات المحاولة — النسخة المحلية (مصدر العرض) مع الإرسال الفوري للباك.
 * - كل اختيار يُرسل فورًا (PUT)؛ إجابات غير المحفوظة تُعاد محاولتها تلقائيًا
 *   عند فتح المحاولة حتى يُسلَّم الباك.
 */
export function useAttemptAnswers(
  attempt: ExamAttemptDetail,
  guard: AttemptGuard
) {
  const attemptId = attempt.id;

  const [answers, setAnswers] = useState<Record<number, ExamAnswerValue>>(
    () => {
      const entry = useExamProgressStore.getState().getEntry(attemptId);
      return computeMerge(
        seedWebServerAnswers(attempt),
        entry?.answers ?? {}
      ).answers;
    }
  );

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
      if (guard.handleExpiryRedirect(error)) return;
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
      const isCleared =
        !current || (current.optionId == null && current.booleanValue == null);

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
      const isCleared =
        !current || (current.optionId == null && current.booleanValue == null);

      if (!isCleared && current.booleanValue === value) {
        commitAnswer(questionId, { optionId: null, booleanValue: null });
      } else {
        commitAnswer(questionId, { optionId: null, booleanValue: value });
      }
    },
    [answers, commitAnswer]
  );

  const answeredCount = useMemo(
    () => attempt.questions.filter((q) => isAnswered(answers[q.id])).length,
    [attempt.questions, answers]
  );

  return {
    answers,
    selectOption,
    selectBoolean,
    answeredCount,
    isSaving: saveAnswer.isPending,
  };
}
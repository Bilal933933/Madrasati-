import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { studentExamsApi } from "../services/studentExamsApi";
import { useExamProgressStore } from "../state/examProgressStore";
import { flaggedRecordsToIds } from "../lib/attempt-utils";
import type {
  ExamAttemptDetail,
  SaveProgressPayload,
} from "../types/attempt.types";
import type { AttemptGuard } from "./useAttemptGuard";

/**
 * مزامنة تقدم المحاولة (الموضع + العلامات) مع الباك — debounced كي لا تُثقَل
 * الشبكة، مع تفريغ آخر مزامنة حال مغادرة الصفحة. يملك حالة العلامات.
 */
export function useAttemptProgressSync(
  attempt: ExamAttemptDetail,
  currentIndex: number,
  guard: AttemptGuard
) {
  const attemptId = attempt.id;

  const [flagged, setFlagged] = useState<Record<number, boolean>>(() => {
    const entry = useExamProgressStore.getState().getEntry(attemptId);
    const serverFlags: Record<number, boolean> = Object.fromEntries(
      (attempt.flagged_question_ids ?? []).map((id) => [id, true])
    );
    // دمج علامات الباك مع النسخة المحلية — المحلية هي نية الطالب الأحدث.
    return { ...serverFlags, ...(entry?.flagged ?? {}) };
  });

  const saveProgress = useMutation({
    mutationFn: (payload: SaveProgressPayload) =>
      studentExamsApi.saveProgress(attemptId, payload),
    onError: (error) => {
      if (guard.handleExpiryRedirect(error)) return;
      toast.error(getErrorMessage(error, "تعذّر حفظ التقدم. سيُعاد عند التغيير التالي."));
    },
  });

  const flaggedIds = useMemo(
    () => flaggedRecordsToIds(flagged),
    [flagged]
  );

  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (guard.isSubmitted()) return;

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      if (guard.isSubmitted()) return;
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
      if (guard.isSubmitted()) return;
      studentExamsApi
        .saveProgress(attemptId, latestProgressRef.current)
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const toggleFlag = useCallback(
    (questionId: number) => {
      setFlagged((prev) => {
        const next = { ...prev, [questionId]: !(prev[questionId] ?? false) };
        useExamProgressStore
          .getState()
          .setFlag(attemptId, questionId, next[questionId]);
        return next;
      });
    },
    [attemptId]
  );

  return { flagged, toggleFlag };
}
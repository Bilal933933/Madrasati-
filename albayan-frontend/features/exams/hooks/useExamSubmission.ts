import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { studentExamsApi } from "../services/studentExamsApi";
import { useAttemptGuard } from "./useAttemptGuard";
import type { AttemptStatus, GradingStatusResponse } from "../types/attempt.types";

interface UseExamSubmissionOptions {
  attemptId: number;
  onGraded?: (attempt: GradingStatusResponse) => void;
  enabled?: boolean;
}

/**
 * هوك التسليم مع polling لحالة التصحيح (للأسئلة النصية).
 * - يرسل طلب التسليم
 * - يبدأ polling كل 2 ثانية للتحقق من حالة التصحيح
 * - عند الاكتمال يُستدعي onGraded ويُحدث الكاش
 */
export function useExamSubmission({
  attemptId,
  onGraded,
  enabled = true,
}: UseExamSubmissionOptions) {
  const queryClient = useQueryClient();
  const guard = useAttemptGuard(attemptId, () => {});
  const [status, setStatus] = useState<AttemptStatus>("in_progress");
  const [isPolling, setIsPolling] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onGradedRef = useRef(onGraded);

  useEffect(() => {
    onGradedRef.current = onGraded;
  }, [onGraded]);

  // Stop polling function (defined first to avoid temporal dead zone)
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Polling function
  const pollGradingStatus = useCallback(async () => {
    if (!enabled || status === "graded") return;

    try {
      const data = await studentExamsApi.getGradingStatus(attemptId);
      setStatus(data.status);
      setGradingError(data.grading_errors ?? null);

      if (data.status === "graded") {
        stopPolling();
        onGradedRef.current?.(data);
        // تحديث الكاش
        queryClient.invalidateQueries({ queryKey: ["exam-attempt", attemptId] });
        queryClient.invalidateQueries({ queryKey: ["exam-results", attemptId] });
      }
    } catch (error) {
      console.error("Grading status poll failed:", error);
      stopPolling();
    }
  }, [attemptId, enabled, queryClient, status, stopPolling]);

  // Start polling after submission
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    setIsPolling(true);
    setStatus("submitted");
    pollIntervalRef.current = setInterval(pollGradingStatus, 2000);
  }, [pollGradingStatus]);

  // Submit mutation
  const submitAttempt = useQuery({
    queryKey: ["exam-submission", attemptId],
    queryFn: () => studentExamsApi.submitAttempt(attemptId),
    enabled: false,
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });

  const submit = useCallback(async () => {
    if (guard.isSubmitted() || submitAttempt.isPending) return;
    guard.markSubmitted();

    try {
      await submitAttempt.refetch();
      startPolling();
    } catch (error) {
      if (guard.handleExpiryRedirect(error)) return;
      guard.resetSubmitted();
      throw error;
    }
  }, [guard, submitAttempt, startPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    submit,
    isSubmitting: submitAttempt.isPending,
    isPolling,
    status,
    gradingError,
    stopPolling,
  };
}

/**
 * هوك لجلب النتائج بعد اكتمال التصحيح
 */
export function useExamResults(attemptId: number, enabled = true) {
  return useQuery({
    queryKey: ["exam-results", attemptId],
    queryFn: () => studentExamsApi.getResults(attemptId),
    enabled: enabled && attemptId > 0,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}
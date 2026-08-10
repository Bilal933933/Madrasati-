import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { notifyUnlockedAchievements } from "@/features/achievements/lib/achievementUnlocks";
import { studentExamsApi } from "../services/studentExamsApi";
import { useExamProgressStore } from "../state/examProgressStore";
import type { AttemptGuard } from "./useAttemptGuard";

/**
 * تسليم المحاولة — يسلّم للباك، ينظّف التقدم المحلي، يبثّ إشعارات الإنجازات
 * المفتوحة، ويعيد التوجيه نحو النتيجة. عند الخطأ يُعيد تعيين الحارس ويجلب
 * الحالة الرسمية ليرى إن كانت المحاولة أُنهيت آليًا.
 */
export function useAttemptSubmission(
  attemptId: number,
  guard: AttemptGuard,
  onSubmitted: () => void
) {
  const queryClient = useQueryClient();

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
      if (guard.handleExpiryRedirect(error)) return;
      toast.error(getErrorMessage(error, "تعذّرت تسليم المحاولة."));
      guard.resetSubmitted();
      queryClient.invalidateQueries({ queryKey: ["exam-attempt", attemptId] });
    },
  });

  const submit = useCallback(() => {
    if (guard.isSubmitted() || submitAttempt.isPending) return;
    guard.markSubmitted();
    submitAttempt.mutate();
  }, [guard, submitAttempt]);

  return { submit, isSubmitting: submitAttempt.isPending };
}
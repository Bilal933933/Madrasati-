import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useExamProgressStore } from "../state/examProgressStore";
import { expiryRedirectId } from "../lib/attempt-utils";

/** مرجع الحارس — يوزَّع على الـ hooks الفرعية ليبقى مصدرًا وحيدًا لحقيقة التسليم. */
export interface AttemptGuard {
  /** هل سُلِّمت المحاولة (أو أُنهيت آليًا)؟ */
  isSubmitted: () => boolean;
  markSubmitted: () => void;
  resetSubmitted: () => void;
  handleExpiryRedirect: (error: unknown) => boolean;
}

/**
 * حارس المحاولة — يملك مرجع التسليم الوحيد وفحص إعادة توجيه انتهاء الوقت.
 * - عند إشارة انتهاء (redirect_to) يسلّم المحاولة محليًا ويوجّه للنتيجة مرة واحدة.
 * - حافظات الحالة في الواجهة دوال مستقرة (لا يُمرَّر ref للكتابة عبر الوسائط).
 * - يُمرَّر إلى hooks الإجابات والتقدم والتسليم ليتشاركوا نفس القرار.
 */
export function useAttemptGuard(
  attemptId: number,
  onSubmitted: () => void
): AttemptGuard {
  const submittedRef = useRef(false);

  const isSubmitted = useCallback(() => submittedRef.current, []);

  const markSubmitted = useCallback(() => {
    submittedRef.current = true;
  }, []);

  const resetSubmitted = useCallback(() => {
    submittedRef.current = false;
  }, []);

  const handleExpiryRedirect = useCallback(
    (error: unknown): boolean => {
      if (submittedRef.current) return true;
      if (expiryRedirectId(error) == null) return false;

      submittedRef.current = true;
      useExamProgressStore.getState().clearAttempt(attemptId);
      toast.info("انتهى وقت الامتحان، تم تصحيح إجاباتك تلقائيًا.");
      onSubmitted();
      return true;
    },
    [attemptId, onSubmitted]
  );

  return { isSubmitted, markSubmitted, resetSubmitted, handleExpiryRedirect };
}
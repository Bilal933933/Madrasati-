import { useEffect, useState } from "react";
import { calcRemaining } from "../lib/attempt-utils";
import type { ExamAttemptDetail } from "../types/attempt.types";
import type { AttemptGuard } from "./useAttemptGuard";

/**
 * مؤقت المحاولة — يُحدّث الوقت المتبقي كل ثانية، ويسلّم آليًا مرة واحدة
 * عند انتهاء الوقت (عبر submitRef المرتبط بأحدث دالة تسليم).
 */
export function useAttemptTimer(
  attempt: ExamAttemptDetail,
  guard: AttemptGuard,
  submitRef: { current: (() => void) | null }
): number {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calcRemaining(attempt)
  );

  const { isSubmitted } = guard;

  useEffect(() => {
    if (!attempt.deadline_at) return;

    const deadline = new Date(attempt.deadline_at).getTime();
    if (deadline - Date.now() <= 0) {
      if (!isSubmitted()) submitRef.current?.();
      return;
    }

    const tick = () => {
      const r = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemainingSeconds(r);

      if (r <= 0 && !isSubmitted()) {
        submitRef.current?.();
      }
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [attempt.id, attempt.deadline_at, isSubmitted, submitRef]);

  return remainingSeconds;
}
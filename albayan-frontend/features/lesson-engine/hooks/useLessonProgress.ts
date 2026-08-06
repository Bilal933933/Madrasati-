import { useMemo } from "react";
import { useLessonProgressStore } from "../state/lessonProgressStore";
import type { LessonProgressEntry } from "../types/progress.types";

export interface LessonProgressResult {
  /** آخر شاشة زارها الطالب — تُستخدم للاستئناف. */
  lastStepId: string | null;
  /** الشاشات المزارة بالترتيب. */
  visitedStepIds: string[];
  /** النسبة المئوية لتقدم الرحلة (0–100). */
  percent: number;
  /** هل أكمل الطالب الدرس كاملًا سابقًا؟ */
  isCompleted: boolean;
  /** هل هناك تقدم محفوظ قابل للاستئناف؟ */
  hasProgress: boolean;
  /** يُسجّل زيارة لشاشة (استدعاء يدوي عند الحاجة). */
  recordStep: (stepId: string, totalSteps: number) => void;
  /** يعلّم الدرس مكتملًا. */
  markCompleted: () => void;
  /** يمسح تقدم الدرس (إعادة البدء). */
  clear: () => void;
  /** قراءة السجل الخام كاملًا. */
  entry: LessonProgressEntry | null;
}

/**
 * هوك تقدم الطالب داخل درس واحد — يقرأ من مخزن التقدم ويمنح دالات التعامل.
 * يعتمد على localStorage؛ لا يرتبط بحالة محرك الدرس نفسها.
 */
export function useLessonProgress(lessonId: number): LessonProgressResult {
  const entry = useLessonProgressStore((state) => state.entries[String(lessonId)] ?? null);
  const recordStep = useLessonProgressStore((state) => state.recordStep);
  const markCompleted = useLessonProgressStore((state) => state.markCompleted);
  const clearLesson = useLessonProgressStore((state) => state.clearLesson);

  return useMemo(() => {
    const visitedStepIds = entry?.visitedStepIds ?? [];
    const totalSteps = entry?.totalSteps ?? 0;
    const percent =
      totalSteps > 0
        ? Math.min(100, Math.round((visitedStepIds.length / totalSteps) * 100))
        : 0;

    return {
      lastStepId: entry?.lastStepId ?? null,
      visitedStepIds,
      percent,
      isCompleted: Boolean(entry?.completedAt),
      hasProgress: visitedStepIds.length > 0,
      recordStep: (stepId, totalSteps) => recordStep(lessonId, stepId, totalSteps),
      markCompleted: () => markCompleted(lessonId),
      clear: () => clearLesson(lessonId),
      entry: entry ?? null,
    };
  }, [entry, lessonId, recordStep, markCompleted, clearLesson]);
}

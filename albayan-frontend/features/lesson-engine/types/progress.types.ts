/**
 * تقدم الطالب داخل الدرس — يُحفظ محليًا (Zustand + localStorage)
 * بلا أي اتصال بالباك. يعرّف «التقدم» على أنه الشاشة الحالية
 * والشاشات التي زارها الطالب فقط.
 */

/** سجل تقدم درس واحد. */
export interface LessonProgressEntry {
  lessonId: number;
  /** إجمالي عدد خطوات الرحلة (start + الكتل + finish) — لحساب النسبة. */
  totalSteps: number;
  /** آخر شاشة كان عليها الطالب — للاستئناف. */
  lastStepId: string | null;
  /** الشاشات التي زارها الطالب بالترتيب (بلا تكرار). */
  visitedStepIds: string[];
  /** اللحظة التي أكمل فيها الطالب الدرس (كاملًا) — null ما لم يُكمل. */
  completedAt: string | null;
  /** آخر لحظة حدث فيها تحديث للتقدم. */
  updatedAt: string | null;
}

/** الشكل الكامل المُحفظ في localStorage — يُغلف السجلات لسهولة التوسع لاحقًا. */
export interface PersistedLessonProgress {
  version: 1;
  entries: Record<string, LessonProgressEntry>;
}

/**
 * تقدم الطالب في محاولة امتحان — يُحفظ محليًا (Zustand + localStorage)
 * لضمان عدم فقدان التقدم عند تحديث الصفحة، مع النسخة الرسمية في الباك.
 */

/** إجابة مُطابَعة (متحيّرة عند غياب الاختيار). */
export interface ExamAnswerValue {
  optionId: number | null;
  booleanValue: boolean | null;
}

/** سجل تقدم محاولة واحدة. */
export interface ExamProgressEntry {
  attemptId: number;
  /** موضع آخر سؤال لأجله الطالب — للاستئناف. */
  index: number;
  /** الأسئلة المعلَّمة عند الطالب. */
  flagged: Record<number, boolean>;
  /** أحدث نسخة كاملة من الإجابات (بما يشملها من الباك) لكل محاولة. */
  answers: Record<number, ExamAnswerValue>;
  /** معرّفات أسئلة إجاباتها المحلية لم تُسلَّم للباك بعد — بانتظار إعادة المحاولة. */
  pendingAnswers: number[];
  /** آخر لحظة حدّث فيها التقدم. */
  updatedAt: string | null;
}

/** الشكل الكامل المُحفظ في localStorage. */
export interface PersistedExamProgress {
  version: 1;
  entries: Record<string, ExamProgressEntry>;
}
import type { LessonScreenKind } from "./types";

/** عنوان المرحلة كما يراه الطالب — بلا تفاصيل تنفيذية. */
export const PHASE_LABEL: Partial<Record<LessonScreenKind, string>> = {
  start: "استعداد",
  content: "شرح الدرس",
  assessment: "اختبر فهمك",
  finish: "نهاية الرحلة",
};

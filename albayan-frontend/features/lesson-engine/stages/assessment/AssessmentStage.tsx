"use client";

import { AssessmentComponent } from "@/features/lesson-engine/components/assessment-component";

/**
 * شاشة التقييم — غلاف للمكوّن الموحّد الذي يدير سير الأسئلة
 * (قبلي/تحقق فهم/نهائي) عبر `current.block.kind`.
 */
export function AssessmentStage() {
  return <AssessmentComponent />;
}

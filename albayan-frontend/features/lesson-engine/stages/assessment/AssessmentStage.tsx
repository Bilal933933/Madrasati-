"use client";

import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { AssessmentComponent } from "@/features/lesson-engine/components/assessment-component";

/**
 * شاشة التقييم — غلاف للمكوّن الموحّد الذي يدير سير الأسئلة
 * (قبلي/تحقق فهم/نهائي) عبر `current.block.kind`.
 */
export function AssessmentStage() {
  return (
    <ScrollReveal className="flex flex-1 flex-col">
      <AssessmentComponent />
    </ScrollReveal>
  );
}

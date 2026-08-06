import type { ComponentType } from "react";
import { StartStage } from "@/features/lesson-engine/stages/start/StartStage";
import { ContentStage } from "@/features/lesson-engine/stages/content/ContentStage";
import { AssessmentStage } from "@/features/lesson-engine/stages/assessment/AssessmentStage";
import { FinishStage } from "@/features/lesson-engine/stages/finish/FinishStage";
import type { LessonScreenKind } from "./types";

/**
 * سجل الشاشات — أربع شاشات للطالب فقط. لا يعرض تفاصيل الكتل؛
 * شاشة المحتوى تتولى توزيع أنواع كتل الـ Builder داخليًا.
 */
export const stageRenderer: Record<LessonScreenKind, ComponentType> = {
  start: StartStage,
  content: ContentStage,
  assessment: AssessmentStage,
  finish: FinishStage,
};

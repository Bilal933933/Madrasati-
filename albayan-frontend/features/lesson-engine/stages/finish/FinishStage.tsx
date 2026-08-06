"use client";

import { CheckCircle2 } from "lucide-react";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";

/**
 * شاشة النهاية — إغلاق الرحلة بكلمة تشجيعية بسيطة. لا تكشف عن النتيجة
 * (رحلة تعلّم لا امتحان)؛ بيانات الدرس تُقدَّر من رضا الطالب لا من الدرجات.
 */
export function FinishStage() {
  const data = useLessonEngineStore((s) => s.data);
  const title = data?.title ?? "هذا الدرس";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <CheckCircle2 className="size-14 text-emerald-600" aria-hidden />
      <h2 className="text-2xl font-bold leading-tight">أكملت {title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        استمر في التعلّم خطوة بخطوة، وستجمع كل يوم فكرة جديدة.
      </p>
    </div>
  );
}

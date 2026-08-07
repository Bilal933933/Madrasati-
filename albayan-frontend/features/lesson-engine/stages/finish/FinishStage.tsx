"use client";

import { Check } from "lucide-react";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";

/**
 * شاشة النهاية — إغلاق الرحلة باحتفال بسيط. لا تكشف عن النتيجة
 * (رحلة تعلّم لا امتحان)؛ تعلّم الدرس يُقدَّر من رضا الطالب لا من الدرجات.
 */
export function FinishStage() {
  const data = useLessonEngineStore((s) => s.data);
  const title = data?.title ?? "هذا الدرس";

  return (
    <div className="relative flex flex-col items-center justify-center gap-5 py-10 text-center">
      {/* توهّج خلفي ناعم خلف دائرة النجاح */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-4 size-40 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
        <Check className="size-10 text-white" strokeWidth={3} aria-hidden />
      </span>

      <h2 className="text-2xl font-bold leading-tight text-foreground">أكملت {title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        استمر في التعلّم خطوة بخطوة، وستجمع كل يوم فكرة جديدة حتى تتقن المفاهيم.
      </p>
    </div>
  );
}
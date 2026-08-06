"use client";

import { useMemo } from "react";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import type { LessonScreenKind } from "@/features/lesson-engine/engine/types";

const SCREEN_HINT: Partial<Record<LessonScreenKind, string>> = {
  start: "أنت في بداية الرحلة",
  content: "أنت تتقدم في الدرس",
  assessment: "اختبر فهمك",
  finish: "أكملت الرحلة",
};

/**
 * شريط التقدم — نسبة مئوية + تسمية موجّهة للطالب.
 * يُحسب من موضع الطالب في الرحلة (currentIndex / total) دون كشف تفاصيل الكتل.
 * لا يظهر على شاشة البداية (لا شيء ليُقاس عليه بعد).
 */
export function ProgressBar() {
  const current = useLessonEngineStore((s) => s.current);
  const currentIndex = useLessonEngineStore((s) => s.currentIndex);
  const total = useLessonEngineStore((s) => s.total);

  const percent = useMemo(() => {
    if (!total || total < 2) {
      return 0;
    }
    return Math.round((currentIndex / (total - 1)) * 100);
  }, [currentIndex, total]);

  const hint = current ? (SCREEN_HINT[current.screen] ?? "") : "";
  const showBar = current?.screen !== "start";

  return (
    <div className="flex w-full flex-col gap-1" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="تقدم الدرس">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
        <span>{hint}</span>
        {showBar && <span className="font-medium tabular-nums">{percent}%</span>}
      </div>
    </div>
  );
}
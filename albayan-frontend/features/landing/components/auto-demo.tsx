"use client";

import type { ReactNode } from "react";
import { useAutoStep } from "../hooks/use-auto-step";
import { cn } from "@/lib/utils";

interface AutoDemoProps {
  /** المراحل التي تُعرض في الحلقة. */
  steps: ReactNode[];
  /** مدة كل مرحلة بالمللي ثانية. */
  interval?: number;
  className?: string;
}

/**
 * شاشة درس تتحرك وحدها في حلقة زمنية هادئة (Auto Demo).
 * تعرض المراحل تباعًا مع انتقال سلس، ويمكن للزائر التوقف بالتمرير عليها.
 * يُستخدم في قسم "داخل الدرس" ليعيش الزائر الدرس دون نقر.
 */
export function AutoDemo({ steps, interval = 4000, className }: AutoDemoProps) {
  const { step, stop, start, paused } = useAutoStep(steps.length, interval);

  if (steps.length === 0) return null;

  return (
    <div
      className={className}
      onMouseEnter={stop}
      onMouseLeave={start}
      onTouchStart={stop}
      onTouchEnd={start}
    >
      <div className="animate-step-in" key={step}>
        {steps[step]}
      </div>
      {steps.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
          {steps.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === step ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
          {paused && (
            <span className="ms-2 text-xs text-muted-foreground">متوقف مؤقتًا</span>
          )}
        </div>
      )}
    </div>
  );
}

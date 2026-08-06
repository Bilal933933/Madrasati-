"use client";

import type { ReactNode } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import { ProgressBar } from "@/features/lesson-engine/components/progress-bar";

interface LessonShellProps {
  /** تسمية الشاشة الحالية (شرح الدرس / اختبر فهمك / ...). */
  phaseLabel?: string;
  /** منطقة المحتوى — تُرسم داخل بطاقة التركيز الواحدة. */
  children: ReactNode;
  /** زر الأسفل — افتراضيًا «متابعة» إلا إذا مرّ للمحتوى (شرح/فيديو). */
  footer?: ReactNode;
  /** هل تُعرض بطاقة التركيز (نعم لكل الشاشات) — تُخفى للبداية لتصميم مختلف. */
  showCard?: boolean;
}

/**
 * إطار الشاشة الجديد (تطبيق تعلم لا صفحة مقال):
 * Header خفيف (المادة · الدرس) ← شريط تقدم ← بطاقة تركيز واحدة ← زر عريض أسفل.
 * يحافظ على زر الرجوع للشاشة السابقة (content/assessment).
 */
export function LessonShell({
  phaseLabel,
  children,
  footer,
  showCard = true,
}: LessonShellProps) {
  const data = useLessonEngineStore((s) => s.data);
  const currentIndex = useLessonEngineStore((s) => s.currentIndex);
  const back = useLessonEngineStore((s) => s.back);
  const next = useLessonEngineStore((s) => s.next);

  const subject = data?.subject;
  const course = data?.course;
  const title = data?.title ?? "درس";
  const canBack = currentIndex > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex w-8 shrink-0 items-center justify-center">
            {canBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={back}
                aria-label="العودة"
                className="size-8"
              >
                <ArrowRight className="size-5" aria-hidden />
              </Button>
            )}
          </div>
          <div className="min-w-0 flex-1 truncate text-center">
            {(subject || course) && (
              <p className="truncate text-[0.7rem] text-muted-foreground">
                {[subject, course].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="truncate text-sm font-semibold leading-tight">{title}</h1>
          </div>
          <span className="w-8 shrink-0" aria-hidden />
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 pb-2.5 sm:px-6">
          <ProgressBar />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5 sm:px-6">
        {phaseLabel && (
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">{phaseLabel}</p>
        )}
        <div
          className={cn(
            "flex flex-1 flex-col",
            showCard &&
              "rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow"
          )}
        >
          {children}
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 mt-auto border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3">
          {footer ?? (
            <Button size="lg" className="h-12 w-full text-base" onClick={() => next()}>
              متابعة
              <ArrowLeft className="size-5" aria-hidden />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowLeft, Check, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import { useLessonProgress } from "@/features/lesson-engine/hooks/useLessonProgress";
import { ProgressBar } from "@/features/lesson-engine/components/progress-bar";
import type { LessonFlowStep } from "@/features/lesson-engine/engine/types";

interface LessonShellProps {
  /** منطقة المحتوى — تُرسم داخل بطاقة التركيز الواحدة. */
  children: ReactNode;
  /** زر الأسفل — افتراضيًا «متابعة» إلا إذا مرّ للمحتوى (شرح/فيديو). */
  footer?: ReactNode;
}

/**
 * إطار الشاشة الجديد (تطبيق تعلم لا صفحة مقال):
 * Header خفيف (المادة · الدرس) ← شريط تقدم ← بطاقة تركيز واحدة ← زر عريض أسفل.
 * يحافظ على زر الرجوع للشاشة السابقة (content/assessment).
 */
export function LessonShell({
  children,
  footer,
}: LessonShellProps) {
  const data = useLessonEngineStore((s) => s.data);
  const current = useLessonEngineStore((s) => s.current);
  const currentIndex = useLessonEngineStore((s) => s.currentIndex);
  const total = useLessonEngineStore((s) => s.total);
  const flow = useLessonEngineStore((s) => s.flow);
  const back = useLessonEngineStore((s) => s.back);
  const next = useLessonEngineStore((s) => s.next);
  const jumpTo = useLessonEngineStore((s) => s.jumpTo);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [desktopMapOpen, setDesktopMapOpen] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const previousStepId = useRef<string | null>(null);
  const previousIndex = useRef<number | null>(null);
  const desktopCurrentRef = useRef<HTMLButtonElement | null>(null);
  const mobileCurrentRef = useRef<HTMLButtonElement | null>(null);
  // وضع المراجعة: بعد إكمال الدرس تُفتح كل الخطوات للتنقل الحر.
  const { isCompleted } = useLessonProgress(data?.lessonId ?? 0);

  const subject = data?.subject;
  const course = data?.course;
  const title = data?.title ?? "درس";
  const canBack = currentIndex > 0;
  const transition = getTransitionMeta(current);

  useEffect(() => {
    if (!current) {
      return;
    }

    const changedStep = previousStepId.current !== null && previousStepId.current !== current.id;
    // الرجوع للخلف لا يعرض إعلان الانتقال — الإعلان للتقدم فقط.
    const wentBack = previousIndex.current !== null && currentIndex < previousIndex.current;
    previousStepId.current = current.id;
    previousIndex.current = currentIndex;

    if (!changedStep || wentBack || current.screen === "start" || current.screen === "finish") {
      return;
    }

    setShowTransition(true);
    const timer = window.setTimeout(() => setShowTransition(false), 700);
    return () => window.clearTimeout(timer);
  }, [current, currentIndex]);

  // تمرير تلقائي للخطوة الحالية في خريطة الدرس (سطح المكتب).
  useEffect(() => {
    if (desktopMapOpen) {
      desktopCurrentRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [currentIndex, desktopMapOpen]);

  // تمرير تلقائي للخطوة الحالية في قائمة الجوال عند فتحها.
  useEffect(() => {
    if (navigationOpen) {
      mobileCurrentRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [currentIndex, navigationOpen]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-background">

      <header className="z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex w-full items-center gap-2 px-4 py-2 sm:px-6">
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
              <p className="truncate text-sm font-medium text-muted-foreground">
                {[subject, course].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="truncate text-lg font-extrabold leading-tight">{title}</h1>
          </div>
          <div className="flex w-8 shrink-0 items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavigationOpen(true)}
              aria-label="فتح خريطة الدرس"
              className="size-8 lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDesktopMapOpen((v) => !v)}
              aria-label={desktopMapOpen ? "إخفاء خريطة الدرس" : "إظهار خريطة الدرس"}
              aria-expanded={desktopMapOpen}
              className="hidden size-8 lg:inline-flex"
            >
              {desktopMapOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </Button>
          </div>
        </div>
        <div className="w-full px-4 pb-2 sm:px-6 lg:hidden">
          <ProgressBar />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="relative flex w-full flex-1 flex-col overflow-y-auto bg-card">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8">
              {children}
            </div>
          </main>

          <footer className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
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

        {desktopMapOpen && (
          <aside
            className="hidden w-64 shrink-0 flex-col border-s border-border/60 bg-card lg:flex xl:w-72"
            aria-label="خريطة الدرس"
          >
            <div className="border-b px-5 py-4">
              <p className="text-sm font-bold">خريطة الدرس</p>
              <p className="text-xs text-muted-foreground">{isCompleted ? "راجع أي جزء بحرية" : "راجع ما سبق أو انتقل إلى موضعك"}</p>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="أجزاء الدرس">
              {flow.map((step, index) => {
                const isCurrent = index === currentIndex;
                const isDone = index < currentIndex;
                const isLocked = index > currentIndex && !isCompleted;
                const label = step.screen === "start"
                  ? "بداية الدرس"
                  : step.screen === "finish"
                    ? "إنهاء الرحلة"
                    : step.screen === "assessment"
                      ? step.block?.kind === "pre_assessment"
                        ? "لنعرف من أين نبدأ"
                        : step.block?.kind === "final_assessment"
                          ? "الاختبار النهائي"
                          : "تحقق من الفهم"
                      : step.block?.kind === "lesson_video"
                        ? "فيديو تعليمي"
                        : "شرح الدرس";

                return (
                  <button
                    key={step.id}
                    ref={isCurrent ? desktopCurrentRef : undefined}
                    type="button"
                    disabled={isLocked}
                    onClick={() => jumpTo(step.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                      isCurrent ? "bg-primary/10 text-primary" : !isLocked && "hover:bg-muted/70"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {isDone ? <Check className="size-3.5" aria-hidden /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
                    {isCurrent && <span className="text-xs">موضعك الحالي</span>}
                    {isLocked && <span className="text-xs text-muted-foreground">لاحقًا</span>}
                  </button>
                );
              })}
            </nav>
            <div className="border-t px-5 py-4 text-center text-xs text-muted-foreground">
              {Math.max(0, currentIndex)} من {Math.max(0, total - 1)} خطوات في الرحلة
            </div>
          </aside>
        )}
      </div>

      {navigationOpen && (
        <div
          className="fixed inset-0 z-30 flex bg-foreground/35 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="خريطة الدرس"
          onClick={() => setNavigationOpen(false)}
        >
          <aside
            className="ms-auto flex h-full w-full max-w-sm flex-col bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="text-sm font-bold">خريطة الدرس</p>
                <p className="text-xs text-muted-foreground">{isCompleted ? "راجع أي جزء بحرية" : "راجع ما سبق أو انتقل إلى موضعك"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setNavigationOpen(false)} aria-label="إغلاق القائمة">
                <X className="size-5" aria-hidden />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="أجزاء الدرس">
              {flow.map((step, index) => {
                const isCurrent = index === currentIndex;
                const isDone = index < currentIndex;
                const isLocked = index > currentIndex && !isCompleted;
                const label = step.screen === "start"
                  ? "بداية الدرس"
                  : step.screen === "finish"
                    ? "إنهاء الرحلة"
                    : step.screen === "assessment"
                      ? step.block?.kind === "pre_assessment"
                        ? "لنعرف من أين نبدأ"
                        : step.block?.kind === "final_assessment"
                          ? "الاختبار النهائي"
                          : "تحقق من الفهم"
                      : step.block?.kind === "lesson_video"
                        ? "فيديو تعليمي"
                        : "شرح الدرس";

                return (
                  <button
                    key={step.id}
                    ref={isCurrent ? mobileCurrentRef : undefined}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      jumpTo(step.id);
                      setNavigationOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                      isCurrent ? "bg-primary/10 text-primary" : !isLocked && "hover:bg-muted/70"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {isDone ? <Check className="size-3.5" aria-hidden /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
                    {isCurrent && <span className="text-xs">موضعك الحالي</span>}
                    {isLocked && <span className="text-xs text-muted-foreground">لاحقًا</span>}
                  </button>
                );
              })}
            </nav>
            <div className="border-t px-5 py-4 text-center text-xs text-muted-foreground">
              {Math.max(0, currentIndex)} من {Math.max(0, total - 1)} خطوات في الرحلة
            </div>
          </aside>
        </div>
      )}

      {showTransition && transition && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-foreground text-background motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          aria-live="polite"
          aria-label={`الانتقال إلى ${transition.label}`}
        >
          <div className="px-6 text-center motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
            <span className="mb-4 block text-5xl" aria-hidden>{transition.icon}</span>
            <p className="text-sm font-semibold text-background/60">{transition.label}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{transition.title}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

function getTransitionMeta(step: LessonFlowStep | null) {
  if (!step || step.screen === "start" || step.screen === "finish") {
    return null;
  }

  if (step.screen === "assessment") {
    if (step.block?.kind === "pre_assessment") {
      return { icon: "◈", label: "لنعرف من أين نبدأ", title: "التقييم القبلي" };
    }
    if (step.block?.kind === "final_assessment") {
      return { icon: "★", label: "لحظة الإتقان", title: "الاختبار النهائي" };
    }
    return { icon: "◆", label: "توقف قصير للتأكد", title: "تحقق من الفهم" };
  }

  if (step.block?.kind === "lesson_video") {
    return { icon: "▶", label: "مراجعة مرئية", title: "فيديو الدرس" };
  }

  const content = step.content?.type === "content" ? step.content.data : null;
  return {
    icon: "◉",
    label: "فكرة جديدة",
    title: content?.kind === "paragraph" && content.title ? content.title : "شرح الدرس",
  };
}

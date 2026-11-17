"use client";

import { ArrowLeft, ArrowRight, Check, FlaskConical, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_LESSON, type SandboxAssessmentStage } from "../mock/lesson";
import { hasLab } from "../mock/paragraph";
import { LAB_VARIANTS, type LabVariant } from "../variants";
import { SandboxAssessment } from "./sandbox-assessment";
import type { SandboxTheme } from "./lab-sandbox-page";
import { SandboxContentView, SandboxFinishView, SandboxStartView } from "./sandbox-lesson-stages";

interface SandboxLessonPageProps {
  variant: LabVariant;
  theme: SandboxTheme;
}

/**
 * محاكاة محرك الدرس داخل البيئة المعزولة: start ← محتوى (مختبر 3D) ←
 * تقييم تكويني ← تقييم ختامي ← ختام، مع شريط تقدم وتنقّل.
 *
 * لا تستورد شيئاً من `lesson-engine`: الشكل والإيقاع محاكاة، والبيانات محلية.
 */
export function SandboxLessonPage({ variant, theme }: SandboxLessonPageProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [themeOverride, setThemeOverride] = useState<SandboxTheme | null>(null);
  const [labVariant, setLabVariant] = useState<LabVariant>(variant);

  const stages = MOCK_LESSON.stages;
  const stage = stages[index];
  const currentTheme = themeOverride ?? theme;
  const isLast = index === stages.length - 1;
  const progress = Math.round(((index + 1) / stages.length) * 100);

  const answeredAll = stage.screen !== "assessment" || stage.questions.every((q) => revealed[q.id]);
  const needsAnswer = !answeredAll;

  const goTo = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(stages.length - 1, nextIndex));
    setIndex(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restartStage = (assessment: SandboxAssessmentStage) => {
    setAnswers((current) => {
      const copy = { ...current };
      for (const question of assessment.questions) delete copy[question.id];
      return copy;
    });
    setRevealed((current) => {
      const copy = { ...current };
      for (const question of assessment.questions) delete copy[question.id];
      return copy;
    });
  };

  const restartLesson = () => {
    setAnswers({});
    setRevealed({});
    goTo(0);
  };

  return (
    <div className={cn("min-h-screen bg-background text-foreground", currentTheme === "dark" && "dark")}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
        <header className="border-b border-border py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
                <FlaskConical className="size-3.5 text-amber-500" aria-hidden />
                بيئة معزولة · محاكاة محرك الدرس
              </p>
              <h1 className="mt-1 font-heading text-xl font-bold leading-tight">{MOCK_LESSON.title}</h1>
              <p className="text-[11px] font-semibold text-muted-foreground">
                {MOCK_LESSON.subject} · {stages.length} خطوات
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sandbox/lab"
                className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                المختبر فقط
              </Link>
              <button
                type="button"
                onClick={() => setThemeOverride((value) => ((value ?? theme) === "dark" ? "light" : "dark"))}
                title="تبديل الثيم"
                aria-label={currentTheme === "dark" ? "التبديل إلى الثيم الفاتح" : "التبديل إلى الثيم الغامق"}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                {currentTheme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
              </button>
            </div>
          </div>

          <nav aria-label="خطوات الدرس" className="mt-3">
            <ol className="flex flex-wrap items-center gap-1.5">
              {stages.map((item, itemIndex) => {
                const isCurrent = itemIndex === index;
                const isDone = itemIndex < index;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(itemIndex)}
                      aria-current={isCurrent ? "step" : undefined}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : isDone
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                            : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {isDone ? <Check className="size-3" aria-hidden /> : <span className="font-mono">{itemIndex + 1}</span>}
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </nav>
        </header>

        <main
          className={cn(
            "flex-1 py-6",
            (stage.screen === "start" || stage.screen === "finish") && "flex flex-col justify-center",
          )}
        >
          {stage.screen === "start" ? (
            <SandboxStartView stage={stage} onStart={() => goTo(index + 1)} />
          ) : null}

          {stage.screen === "content" ? (
            <div className="flex flex-col gap-4">
              {hasLab(stage.content) ? (
                <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">هيئة عرض المختبر</span>
                  <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                    {LAB_VARIANTS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setLabVariant(option.id)}
                        title={option.hint}
                        aria-pressed={labVariant === option.id}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
                          labVariant === option.id
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <SandboxContentView stage={stage} variant={labVariant} />
            </div>
          ) : null}

          {stage.screen === "assessment" ? (
            <div className="mx-auto w-full max-w-2xl">
              <SandboxAssessment
                key={stage.id}
                stage={stage}
                answers={answers}
                revealed={revealed}
                onAnswer={(questionId, optionId) =>
                  setAnswers((current) => ({ ...current, [questionId]: optionId }))
                }
                onReveal={(questionId) => setRevealed((current) => ({ ...current, [questionId]: true }))}
                onRestart={() => restartStage(stage)}
              />
            </div>
          ) : null}

          {stage.screen === "finish" ? (
            <SandboxFinishView
              stage={stage}
              lesson={MOCK_LESSON}
              answers={answers}
              onRestart={restartLesson}
            />
          ) : null}
        </main>

        <footer className="border-t border-border py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ArrowRight className="size-3.5" aria-hidden />
              السابق
            </button>

            <p className="text-[11px] font-semibold text-muted-foreground">
              {needsAnswer ? "أكمل أسئلة هذه المرحلة للمتابعة" : `الخطوة ${index + 1} من ${stages.length}`}
            </p>

            {isLast ? (
              <button
                type="button"
                onClick={restartLesson}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                إعادة من البداية
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={needsAnswer}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                التالي
                <ArrowLeft className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FlaskConical,
  GraduationCap,
  Target,
  XCircle,
} from "lucide-react";
import type { LabVariant } from "../variants";
import type {
  SandboxContentStage,
  SandboxFinishStage,
  SandboxLesson,
  SandboxScore,
  SandboxStartStage,
} from "../mock/lesson";
import { scoreLesson } from "../mock/lesson";
import { SandboxRichContent } from "./sandbox-rich-content";

/* ------------------------------ البداية ------------------------------ */

export function SandboxStartView({
  stage,
  onStart,
}: {
  stage: SandboxStartStage;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-bold text-primary">
        <GraduationCap className="size-3.5" aria-hidden />
        درس تفاعلي · {stage.subject} · {stage.grade}
      </span>

      <h2 className="font-heading text-3xl font-black leading-tight tracking-tight">{stage.title}</h2>

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
          <Clock3 className="size-3" aria-hidden />
          {stage.durationMinutes} دقيقة
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
          <FlaskConical className="size-3" aria-hidden />
          مختبر 3D
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
          <Target className="size-3" aria-hidden />
          تقييمان
        </span>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">أهداف الدرس</h3>
        <ul className="grid gap-2">
          {stage.objectives.map((objective) => (
            <li key={objective} className="flex items-start gap-2 text-sm leading-relaxed">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        ابدأ الدرس
        <ArrowLeft className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/* ------------------------------ المحتوى + المختبر ------------------------------ */

export function SandboxContentView({
  stage,
  variant,
}: {
  stage: SandboxContentStage;
  variant: LabVariant;
}) {
  return (
    <div className="flex flex-col gap-4">
      <header className="mx-auto w-full max-w-2xl">
        <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
          <BookOpen className="size-3.5 text-amber-500" aria-hidden />
          المحتوى · فقرة تحوي عقدة مختبر 3D
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold leading-tight">{stage.title}</h2>
      </header>

      <SandboxRichContent doc={stage.content} labSize={variant === "compact" ? "compact" : "stage"} />
    </div>
  );
}

/* ------------------------------ الختام ------------------------------ */

export function SandboxFinishView({
  stage,
  lesson,
  answers,
  onRestart,
}: {
  stage: SandboxFinishStage;
  lesson: SandboxLesson;
  answers: Record<string, number>;
  onRestart: () => void;
}) {
  const { byStage, total } = scoreLesson(lesson, answers);
  const passed = total.percent >= 60;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span
          className={
            passed
              ? "grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }
        >
          {passed ? <CheckCircle2 className="size-6" aria-hidden /> : <XCircle className="size-6" aria-hidden />}
        </span>
        <h2 className="font-heading text-2xl font-bold">{stage.title}</h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{stage.message}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <ScoreCard label="النتيجة الكلية" score={total} highlight />
        {lesson.stages
          .filter((item) => item.screen === "assessment")
          .map((item) => (
            <ScoreCard
              key={item.id}
              label={item.mode === "formative" ? "التقييم التكويني" : "التقييم الختامي"}
              score={byStage[item.id]}
            />
          ))}
      </div>

      <p className="text-center text-xs font-semibold text-muted-foreground">
        {passed
          ? "أتقنت حفظ الطاقة الميكانيكية. يمكنك إعادة التجربة بقيم مختلفة للتثبيت."
          : "لم تبلغ 60%. راجع شرح المختبر ثم أعد المحاولة — لا شيء يُحفظ في هذه البيئة."}
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mx-auto inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-muted"
      >
        إعادة التجربة من البداية
      </button>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  highlight = false,
}: {
  label: string;
  score?: SandboxScore;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border border-primary/30 bg-primary/5 p-3 text-center"
          : "rounded-2xl border border-border bg-card p-3 text-center"
      }
    >
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
        {score ? `${score.correct}/${score.total}` : "—"}
      </p>
      <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
        {score ? `${score.percent}%` : "—"}
      </p>
    </div>
  );
}

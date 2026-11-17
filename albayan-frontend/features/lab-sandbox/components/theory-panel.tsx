"use client";

import { Lightbulb, RotateCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LabDefinition, LabFormula, LabFormulaTone } from "../engine/types";
import { MathFormula } from "./math-formula";

const TONE: Record<LabFormulaTone, { card: string; label: string }> = {
  blue: { card: "border-blue-500/25 bg-blue-500/10", label: "text-blue-700 dark:text-blue-300" },
  green: {
    card: "border-emerald-500/25 bg-emerald-500/10",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  purple: {
    card: "border-violet-500/25 bg-violet-500/10",
    label: "text-violet-700 dark:text-violet-300",
  },
  amber: { card: "border-amber-500/25 bg-amber-500/10", label: "text-amber-700 dark:text-amber-300" },
};

/** صفحة الشرح — تُبنى من بيانات المختبر فقط، بلا حالة فيزيائية */
export function TheoryPanel({ lab }: { lab: LabDefinition }) {
  return (
    <article className="flex h-full flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
          {lab.badge}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{lab.pageRef}</span>
      </header>

      <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight">{lab.title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{lab.intro}</p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {lab.formulas.map((formula) => (
          <FormulaCard key={formula.tag} formula={formula} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2">
        <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">
          ∞ {lab.banner.label}
        </span>
        <MathFormula latex={lab.banner.latex} className="text-xs text-violet-700 dark:text-violet-200" />
      </div>

      <QuizCard question={lab.quiz.question} answer={lab.quiz.answer} />
    </article>
  );
}

function FormulaCard({ formula }: { formula: LabFormula }) {
  const tone = TONE[formula.tone];

  return (
    <div className={cn("relative overflow-hidden rounded-xl border p-3", tone.card)}>
      <span className={cn("block text-[11px] font-bold", tone.label)}>{formula.label}</span>
      <MathFormula latex={formula.latex} display className="my-1.5 block text-center text-sm" />
      <p className="text-[11px] leading-relaxed text-muted-foreground">{formula.note}</p>
    </div>
  );
}

function QuizCard({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-auto">
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
        <Lightbulb className="size-3.5 text-amber-500" aria-hidden />
        اختبر فهمك
      </h3>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-pressed={open}
        className="block h-32 w-full rounded-xl text-start [perspective:1000px]"
      >
        <div
          className={cn(
            "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none",
            open && "[transform:rotateY(180deg)]",
          )}
        >
          <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-amber-500/40 bg-card p-3.5 [backface-visibility:hidden]">
            <p className="text-xs font-semibold leading-relaxed text-foreground">{question}</p>
            <span className="flex items-center gap-1 self-end text-[11px] font-bold text-amber-600 dark:text-amber-400">
              انقر لعرض الإجابة
              <RotateCw className="size-3" aria-hidden />
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 p-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xs font-semibold leading-relaxed text-white">{answer}</p>
          </div>
        </div>
      </button>
    </section>
  );
}

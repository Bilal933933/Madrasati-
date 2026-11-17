"use client";

import { CheckCircle2, ChevronLeft, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SandboxAssessmentStage, SandboxQuestion } from "../mock/lesson";

const MODE_META = {
  formative: {
    label: "تقييم تكويني",
    note: "أسئلة تدريبية قصيرة للتأكد من الفهم قبل المتابعة.",
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  final: {
    label: "تقييم ختامي",
    note: "أسئلة تُحسب في نتيجتك النهائية لهذه التجربة.",
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
} as const;

interface SandboxAssessmentProps {
  stage: SandboxAssessmentStage;
  answers: Record<string, number>;
  revealed: Record<string, boolean>;
  onAnswer: (questionId: string, optionId: number) => void;
  onReveal: (questionId: string) => void;
  onRestart: () => void;
}

/** تسلسل الأسئلة بنفس إيقاع المحرك: سؤال واحد، تحقّق، تغذية راجعة، ثم التالي */
export function SandboxAssessment({
  stage,
  answers,
  revealed,
  onAnswer,
  onReveal,
  onRestart,
}: SandboxAssessmentProps) {
  const [index, setIndex] = useState(0);
  const meta = MODE_META[stage.mode];

  const question = stage.questions[index];
  const selected = answers[question.id];
  const isRevealed = revealed[question.id] === true;
  const isLast = index === stage.questions.length - 1;
  const correctCount = stage.questions.filter((item) => answers[item.id] === item.correctOptionId).length;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-muted-foreground">{meta.label}</p>
          <h2 className="font-heading text-xl font-bold">{stage.title}</h2>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", meta.tone)}>
          السؤال {index + 1} من {stage.questions.length}
        </span>
      </header>

      <p className="text-xs leading-relaxed text-muted-foreground">{meta.note}</p>

      <ol className="flex items-center gap-1.5" aria-label="تقدّم الأسئلة">
        {stage.questions.map((item, itemIndex) => {
          const done = revealed[item.id] === true;
          const correct = answers[item.id] === item.correctOptionId;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setIndex(itemIndex)}
                aria-current={itemIndex === index ? "step" : undefined}
                aria-label={`السؤال ${itemIndex + 1}`}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-colors",
                  itemIndex === index
                    ? "bg-primary"
                    : done
                      ? correct
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                      : "bg-muted",
                )}
              />
            </li>
          );
        })}
      </ol>

      <QuestionCard
        key={question.id}
        question={question}
        selected={selected}
        revealed={isRevealed}
        onSelect={(optionId) => onAnswer(question.id, optionId)}
      />

      {isRevealed ? (
        <div
          role="status"
          className={cn(
            "flex flex-col gap-1.5 rounded-xl border p-3",
            selected === question.correctOptionId
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-rose-500/30 bg-rose-500/10",
          )}
        >
          <span className="flex items-center gap-1.5 text-xs font-bold">
            {selected === question.correctOptionId ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                إجابة صحيحة
              </>
            ) : (
              <>
                <XCircle className="size-4 text-rose-600 dark:text-rose-400" aria-hidden />
                إجابة غير صحيحة
              </>
            )}
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">{question.explanation}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (isRevealed) {
              if (!isLast) setIndex(index + 1);
              return;
            }
            if (selected !== undefined) onReveal(question.id);
          }}
          disabled={selected === undefined || (isLast && isRevealed)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {isRevealed ? (
            isLast ? (
              "النتيجة أعلاه"
            ) : (
              <>
                السؤال التالي
                <ChevronLeft className="size-3.5" aria-hidden />
              </>
            )
          ) : (
            "تحقّق من الإجابة"
          )}
        </button>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          <span dir="ltr" className="font-mono tabular-nums">
            {correctCount} / {stage.questions.length}
          </span>
          {isLast && isRevealed ? (
            <button
              type="button"
              onClick={() => {
                onRestart();
                setIndex(0);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary"
            >
              <RotateCcw className="size-3" aria-hidden />
              إعادة المحاولة
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ بطاقة السؤال ------------------------------ */

function QuestionCard({
  question,
  selected,
  revealed,
  onSelect,
}: {
  question: SandboxQuestion;
  selected: number | undefined;
  revealed: boolean;
  onSelect: (optionId: number) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-4">
      <legend className="sr-only">{question.prompt}</legend>
      <p className="mb-3 text-sm font-bold leading-relaxed">{question.prompt}</p>

      <div className="grid gap-2">
        {question.options.map((option) => {
          const isCorrect = option.id === question.correctOptionId;
          const isPicked = option.id === selected;

          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                revealed
                  ? isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : isPicked
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-border bg-background opacity-60"
                  : isPicked
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-muted/60",
                revealed && "cursor-default",
              )}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={isPicked}
                onChange={() => onSelect(option.id)}
                disabled={revealed}
                className="size-3.5 accent-[var(--primary)]"
              />
              {option.content}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

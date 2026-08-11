"use client";

import { useState } from "react";
import { Check, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "../types/ai-chat.types";

const AR_LABELS = ["أ", "ب", "ج", "د", "هـ", "و"];

/**
 * بطاقة سؤال اختبار يولّده المعلم الذكي (Structured Output):
 * - يختار الطالب الخيار، فتُظهر البطاقة صحّة الإجابة فورًا مع الشرح.
 * - زر «أظهر الإجابة» يكشف الإجابة والشرح دون اختيار.
 */
export function QuizCard({ quiz }: { quiz: QuizQuestion }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const answered = selected !== null || revealed;
  const correctIndex = quiz.correctAnswerIndex;

  return (
    <div className="w-full max-w-[85%] rounded-2xl rounded-tr-sm border border-border/60 bg-muted/40 p-4">
      {quiz.subject?.trim() && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {quiz.subject}
        </p>
      )}

      <p className="mb-3 text-sm font-semibold leading-relaxed">
        {quiz.question}
      </p>

      <div className="space-y-2">
        {quiz.options.map((option, index) => {
          const isCorrect = index === correctIndex;
          const isSelected = index === selected;
          return (
            <button
              key={index}
              type="button"
              disabled={answered}
              onClick={() => setSelected(index)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm leading-relaxed transition-colors",
                !answered && "border-border/70 hover:border-primary/50",
                answered && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                answered && isSelected && !isCorrect && "border-destructive/60 bg-destructive/10",
                answered && !isCorrect && !isSelected && "opacity-60"
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold">
                {isSelected || (answered && isCorrect) ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  (AR_LABELS[index] ?? `${index + 1}`)
                )}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {!answered && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-3 text-xs font-medium text-primary hover:underline"
        >
          أظهر الإجابة
        </button>
      )}

      {answered && quiz.explanation?.trim() && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          {quiz.explanation}
        </p>
      )}
    </div>
  );
}
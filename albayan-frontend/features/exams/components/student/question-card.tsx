import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_LABELS, type QuestionType } from "../../types/exam.types";
import type { AttemptQuestion } from "../../types/attempt.types";

const LETTERS = ["أ", "ب", "ج", "د"];

interface QuestionCardProps {
  question: AttemptQuestion;
  index: number;
  total: number;
  revealed: boolean;
  selectedOptionId?: number | null;
  selectedBoolean?: boolean | null;
  onSelectOption?: (optionId: number) => void;
  onSelectBoolean?: (value: boolean) => void;
}

interface RowStyle {
  container: string;
  chip: string;
  leading: ReactNode;
}

/**
 * حساب مظهر صف الخيار حسب الحالة (أداء/مراجعة وما أصاب/أخطأ).
 */
function rowStyle(
  revealed: boolean,
  isActive: boolean,
  isCorrect: boolean,
  isWrong: boolean,
  leading: ReactNode
): RowStyle {
  if (revealed) {
    if (isWrong) {
      return {
        container: "border-destructive bg-destructive/10 text-destructive",
        chip: "border-destructive bg-destructive/15 text-destructive",
        leading: <X className="size-4" aria-hidden />,
      };
    }
    if (isCorrect) {
      return {
        container: "border-success bg-success/10 text-success",
        chip: "border-success bg-success/15 text-success",
        leading: <Check className="size-4" aria-hidden />,
      };
    }
    return {
      container: "border-border opacity-80 text-foreground/80",
      chip: "border-border bg-muted text-muted-foreground",
      leading,
    };
  }

  if (isActive) {
    return {
      container:
        "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
      chip: "border-primary bg-primary text-primary-foreground",
      leading: <Check className="size-4" aria-hidden />,
    };
  }

  return {
    container: "border-border hover:border-muted-foreground/25 hover:bg-muted",
    chip: "border-border bg-muted text-muted-foreground",
    leading,
  };
}

/**
 * بطاقة سؤال — وضع أداء (التحديد والحفظ) أو وضع مراجعة بعد التسليم.
 */
export function QuestionCard({
  question,
  index,
  total,
  revealed,
  selectedOptionId,
  selectedBoolean,
  onSelectOption,
  onSelectBoolean,
}: QuestionCardProps) {
  const type = question.type ?? "mcq";
  const isTrueFalse = type === "true_false";

  function renderRow(
    key: string | number,
    isActive: boolean,
    isCorrect: boolean,
    isWrong: boolean,
    letter: ReactNode,
    label: ReactNode,
    onClick?: () => void
  ) {
    const style = rowStyle(revealed, isActive, isCorrect, isWrong, letter);

    return (
      <button
        key={key}
        type="button"
        disabled={revealed}
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-start transition-all duration-200",
          style.container,
          revealed ? "cursor-default" : "cursor-pointer"
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold",
            style.chip
          )}
        >
          {style.leading}
        </span>
        <span className="flex-1 text-base leading-relaxed font-medium text-current">
          {label}
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-md"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-muted-foreground">
          سؤال {index + 1} من {total}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {QUESTION_TYPE_LABELS[type as QuestionType]}
        </span>
      </div>

      <p className="mb-5 text-base leading-relaxed font-medium text-foreground">
        {question.content}
      </p>

      <div className="space-y-2.5">
        {isTrueFalse
          ? [true, false].map((value) => {
              const selected = selectedBoolean === value;
              const isCorrect = revealed && question.correct_boolean === value;
              const isWrong =
                revealed && selected && question.correct_boolean !== value;

              return renderRow(
                value ? "true" : "false",
                selected,
                isCorrect,
                isWrong,
                value ? "✓" : "×",
                value ? "صحيح" : "خطأ",
                () => onSelectBoolean?.(value)
              );
            })
          : question.options.map((option, i) => {
              const letter = LETTERS[i % LETTERS.length];
              const selected = selectedOptionId === option.id;
              const isCorrect = revealed && question.correct_option_id === option.id;
              const isWrong =
                revealed && selected && question.correct_option_id !== option.id;

              return renderRow(
                option.id,
                selected,
                isCorrect,
                isWrong,
                letter,
                option.content,
                () => onSelectOption?.(option.id)
              );
            })}
      </div>

      {revealed && question.explanation && (
        <div className="mt-5 rounded-xl bg-muted px-4 py-3">
          <p className="text-sm font-bold text-muted-foreground">شرح الإجابة:</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {question.explanation}
          </p>
        </div>
      )}
    </motion.div>
  );
}
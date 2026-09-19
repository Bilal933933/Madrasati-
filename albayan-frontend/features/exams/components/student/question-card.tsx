import { motion } from "motion/react";
import { Check, X, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
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
  selectedText?: string | null;
  onSelectOption?: (optionId: number) => void;
  onSelectBoolean?: (value: boolean) => void;
  onSelectText?: (text: string) => void;
  isSaving?: boolean;
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
  selectedText,
  onSelectOption,
  onSelectBoolean,
  onSelectText,
  isSaving,
}: QuestionCardProps) {
  const type = question.type ?? "mcq";
  const isTrueFalse = type === "true_false";
  const isShortAnswer = type === "short_answer";
  const isEssay = type === "essay";
  const isNumeric = type === "numeric";

  const [textValue, setTextValue] = useState(selectedText ?? "");

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

  // نموذج الإدخال للأسئلة النصية والرقمية
  function renderTextInput() {
    const isDisabled = revealed || isSaving;
    const aiGrade = question.ai_grade;
    const showAiGrade = revealed && aiGrade && aiGrade.status !== "pending_manual";

    return (
      <div className="space-y-3">
        {isNumeric ? (
          <input
            type="number"
            value={textValue}
            onChange={(e) => {
              setTextValue(e.target.value);
              onSelectText?.(e.target.value);
            }}
            disabled={isDisabled}
            placeholder="أدخل القيمة الرقمية..."
            className={cn(
              "w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground transition-colors",
              isDisabled && "opacity-60 cursor-not-allowed",
              !isDisabled && "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
            dir="ltr"
          />
        ) : (
          <textarea
            value={textValue}
            onChange={(e) => {
              setTextValue(e.target.value);
              onSelectText?.(e.target.value);
            }}
            disabled={isDisabled}
            placeholder={
              isShortAnswer
                ? "اكتب إجابتك هنا..."
                : "اكتب إجابتك المقالية هنا..."
            }
            rows={isEssay ? 8 : 2}
            className={cn(
              "w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground transition-colors",
              isDisabled && "opacity-60 cursor-not-allowed",
              !isDisabled && "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "resize-y min-h-[60px]"
            )}
            dir="rtl"
          />
        )}
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            جاري الحفظ...
          </div>
        )}

        {/* تقييم المساعد بعد المراجعة */}
        {showAiGrade && aiGrade && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
              <span className="rounded-full bg-blue-100 px-2 py-0.5">تقييم المساعد</span>
            </div>
            <p className="mt-2 text-sm text-blue-900">{aiGrade.feedback}</p>

            {aiGrade.criteria && aiGrade.criteria.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-blue-700">معايير التقييم:</p>
                {aiGrade.criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-blue-800"
                  >
                    <span>{c.criterion}</span>
                    <span className="font-bold">{c.score}%</span>
                  </div>
                ))}
              </div>
            )}

            {aiGrade.strengths && aiGrade.strengths.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-green-700">نقاط القوة:</p>
                <ul className="mt-1 text-xs text-green-800 space-y-0.5">
                  {aiGrade.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiGrade.improvements && aiGrade.improvements.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-orange-700">مقترحات للتحسين:</p>
                <ul className="mt-1 text-xs text-orange-800 space-y-0.5">
                  {aiGrade.improvements.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiGrade.status === "pending_manual" && (
              <div className="mt-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  ⏳ هذا السؤال قيد المراجعة اليدوية من قبل المعلم. ستظهر النتيجة لاحقًا.
                </p>
              </div>
            )}
          </div>
        )}

        {/* النموذج الصحيح بعد المراجعة */}
        {revealed && !showAiGrade && question.model_answer && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4">
            <p className="text-sm font-bold text-success">الإجابة النموذجية:</p>
            <p className="mt-1 text-sm text-foreground/90">{question.model_answer}</p>
          </div>
        )}

        {revealed && question.explanation && !question.ai_grade && (
          <div className="rounded-xl bg-muted px-4 py-3">
            <p className="text-sm font-bold text-muted-foreground">شرح الإجابة:</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
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
        {isShortAnswer || isEssay || isNumeric ? (
          renderTextInput()
        ) : isTrueFalse ? (
          [true, false].map((value) => {
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
        ) : (
          question.options.map((option, i) => {
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
          })
        )}
      </div>

      {revealed && question.explanation && !question.ai_grade && (
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
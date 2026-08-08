import { ArrowLeft, Flag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttemptQuestion } from "../../types/attempt.types";
import type { ExamAnswerValue } from "../../types/progress.types";

type AnswerMap = Record<number, ExamAnswerValue | undefined>;

interface NavigationFooterProps {
  questions: AttemptQuestion[];
  currentIndex: number;
  answers: AnswerMap;
  flagged: Record<number, boolean>;
  answeredCount: number;
  isSubmitting: boolean;
  isFirst: boolean;
  isLast: boolean;
  onJump: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

function isAnswered(value: AnswerMap[number]): boolean {
  return value != null && (value.optionId != null || value.booleanValue != null);
}

/**
 * شريط التنقّل في محرك الاختبار: شبكة أرقام الأسئلة + أزرار السابق/التالي/الإنهاء.
 */
export function NavigationFooter({
  questions,
  currentIndex,
  answers,
  flagged,
  answeredCount,
  isSubmitting,
  isFirst,
  isLast,
  onJump,
  onPrev,
  onNext,
  onFinish,
}: NavigationFooterProps) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirst}
            aria-label="السؤال السابق"
          >
            <ArrowLeft className="rotate-180 rtl:rotate-0" aria-hidden />
          </Button>

          <Button
            variant="outline"
            onClick={onNext}
            disabled={isLast}
            aria-label="السؤال التالي"
          >
            <ArrowLeft className="rtl:rotate-180" aria-hidden />
          </Button>

          <Button
            variant="destructive"
            onClick={onFinish}
            disabled={isSubmitting}
            className="ms-auto"
          >
            <Send className="size-4" aria-hidden />
            إنهاء الاختبار
          </Button>
        </div>

        <div
          className="mt-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="أسئلة الامتحان"
        >
          {questions.map((question, index) => {
            const answered = isAnswered(answers[question.id]);
            const isFlagged = flagged[question.id] === true;
            const isCurrent = index === currentIndex;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => onJump(index)}
                aria-label={`الانتقال إلى سؤال ${index + 1}`}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "relative flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : answered
                      ? "border-success/40 bg-success/15 text-success"
                      : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                {index + 1}
                {isFlagged && (
                  <span className="absolute -top-1.5 -end-1.5 flex size-3.5 items-center justify-center rounded-full bg-warning text-[9px] text-warning-foreground">
                    <Flag className="size-2.5" aria-hidden />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>أجبت عن {answeredCount} من {questions.length}</span>
          <span className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1">
              <Flag className="size-3 text-warning" aria-hidden /> مُعلَّم
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
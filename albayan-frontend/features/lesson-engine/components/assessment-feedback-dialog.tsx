"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExplanationCard } from "@/features/assessments/components/question/explanation-card";
import type { AssessmentMode } from "@/features/lesson-engine/engine/types";
import { cn } from "@/lib/utils";

// رسائل التغذية الراجعة (وثيقة الرحلة 6.4).
const FEEDBACK_CORRECT: Record<AssessmentMode, string> = {
  pre: "أحسنت. يبدو أنك تعرف الأساسيات. لنبدأ الدرس.",
  understanding: "أحسنت، فهمت الفقرة.",
  final: "أحسنت.",
};

const FEEDBACK_REDIRECT: Record<AssessmentMode, string> = {
  pre: "لا بأس. سنشرح كل شيء خطوة بخطوة.",
  understanding: "يبدو أن الفقرة السابقة تحتاج مراجعة.",
  final: "لا بأس. لنتابع.",
};

interface AssessmentFeedbackDialogProps {
  /** فتح الديلوج — يُربط بحالة الكشف عن الإجابة. */
  open: boolean;
  /** هل الإجابة صحيحة (أخضر) أم خاطئة (أحمر). */
  correct: boolean;
  mode: AssessmentMode;
  /** هل هذا آخر سؤال (لتسمية زر المتابعة). */
  isLast: boolean;
  /** توضيح السؤال — يُعرض داخل الديلوج عند وجوده. */
  explanation?: string | null;
  /** المتابعة للسؤال/الخطوة التالية. */
  onProceed: () => void;
  /** العودة إلى الفقرة السابقة (مراجعة). */
  onBackToParagraph: () => void;
}

/**
 * ديلوج التغذية الراجعة — يظهر بعد الإجابة: أخضر للصواب وأحمر للخطأ،
 * ويحمل رسالة التوجيه مع توضيح السؤال. غير قابل للصرف (بلا زر إغلاق
 * ولا إغلاق بالنقر خارجًا) — الخروج بإحدى الخطوتين المعروضتين فقط.
 */
export function AssessmentFeedbackDialog({
  open,
  correct,
  mode,
  isLast,
  explanation,
  onProceed,
  onBackToParagraph,
}: AssessmentFeedbackDialogProps) {
  const nextLabel = isLast
    ? mode === "final"
      ? "إنهاء الاختبار"
      : "متابعة الدرس"
    : "التالي";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={cn(
          "text-center sm:max-w-md",
          correct ? "border-emerald-500/40" : "border-destructive/40"
        )}
      >
        {correct ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Check className="size-7" aria-hidden />
            </span>
            <DialogTitle className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              إجابة صحيحة
            </DialogTitle>
            <DialogDescription className="text-sm">
              {FEEDBACK_CORRECT[mode]}
            </DialogDescription>
            {explanation && (
              <ExplanationCard tone="success" className="w-full text-start">
                {explanation}
              </ExplanationCard>
            )}
            <p className="text-xs text-muted-foreground">
              ننتقل تلقائيًا بعد لحظة...
            </p>
            <Button
              size="lg"
              className="h-12 w-full bg-emerald-600 text-base text-white hover:bg-emerald-600/90"
              onClick={onProceed}
            >
              متابعة الآن
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <X className="size-7" aria-hidden />
            </span>
            <DialogTitle className="text-xl font-bold text-destructive">
              لنراجع الفكرة
            </DialogTitle>
            <DialogDescription className="text-sm">
              {FEEDBACK_REDIRECT[mode]}
            </DialogDescription>
            {explanation && (
              <ExplanationCard className="w-full text-start">
                {explanation}
              </ExplanationCard>
            )}
            <Button
              size="lg"
              className="h-12 w-full text-base"
              onClick={onProceed}
            >
              {nextLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full text-base"
              onClick={onBackToParagraph}
            >
              العودة إلى الفقرة السابقة
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

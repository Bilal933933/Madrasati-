import { ArrowLeft, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExamAttemptDetail } from "../../types/attempt.types";
import { ScoreCircle } from "./score-circle";
import { QuestionCard } from "./question-card";
import { formatDateTime } from "../../lib/attemptFormat";

function isAnswered(q: { selected_option_id: number | null; selected_boolean: boolean | null }) {
  return q.selected_option_id != null || q.selected_boolean != null;
}

/**
 * نتيجة المحاولة بعد التسليم + المراجعة التفصيلية (حسب إذن الكشف).
 */
export function ResultView({ attempt }: { attempt: ExamAttemptDetail }) {
  const total = attempt.total_questions;
  const correct = attempt.correct_count;
  const unanswered = attempt.questions.filter((q) => !isAnswered(q)).length;
  const wrong = total - correct - unanswered;
  const score = attempt.score_percentage ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <ScrollReveal>
        <div className="mb-8 flex flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-md sm:p-8">
        <ScoreCircle percentage={score} />

        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold",
              attempt.passed === true
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {attempt.passed === true ? "ممتاز — ناجح" : "لم يتم الاجتياز"}
          </span>
          <p className="text-sm text-muted-foreground">
            سُلّمت في {formatDateTime(attempt.submitted_at)}
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted p-3">
            <span className="block text-xs font-bold text-muted-foreground">صحيحة</span>
            <span className="mt-1 block text-xl font-black text-success">{correct}</span>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <span className="block text-xs font-bold text-muted-foreground">خاطئة</span>
            <span className="mt-1 block text-xl font-black text-destructive">{wrong}</span>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <span className="block text-xs font-bold text-muted-foreground">بدون إجابة</span>
            <span className="mt-1 block text-xl font-black text-muted-foreground">{unanswered}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/exams/${attempt.blueprint_id}`}>
              <ArrowLeft className="rtl:rotate-180" aria-hidden />
              العودة للامتحان
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/exams">
              <Home className="size-4" aria-hidden />
              كل الامتحانات
            </Link>
          </Button>
        </div>
      </div>
      </ScrollReveal>

      {attempt.revealed ? (
        <ScrollReveal delay={120}>
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <CheckCircle2 className="size-5 text-success" aria-hidden />
              مراجعة الإجابات
            </h2>
            {attempt.questions.map((q, index) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={index}
                total={attempt.total_questions}
                revealed
                selectedOptionId={q.selected_option_id}
                selectedBoolean={q.selected_boolean}
              />
            ))}
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal delay={120}>
          <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
            المراجعة التفصيلية غير متاحة لصاحب هذا الامتحان. تعلّم من النقاط
            الخاطئة في محاولتك القادمة.
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
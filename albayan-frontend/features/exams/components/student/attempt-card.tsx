import { ArrowLeft, CheckCircle2, Clock, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTime } from "../../lib/attemptFormat";
import type { ExamAttemptSummary } from "../../types/attempt.types";

const STATUS_STYLES: Record<
  ExamAttemptSummary["status"],
  { label: string; className: string }
> = {
  in_progress: { label: "قيد التنفيذ", className: "bg-warning/15 text-warning-foreground" },
  completed: { label: "مكتمل", className: "bg-success/15 text-success" },
};

/**
 * بطاقة محاولة ضمن سجل محاولاتي — يُتابَع منها أو تُعرَض نتيجتها.
 */
export function AttemptCard({
  attempt,
  resultHref,
  continueHref,
}: {
  attempt: ExamAttemptSummary;
  resultHref: string;
  continueHref: string;
}) {
  const status = STATUS_STYLES[attempt.status] ?? STATUS_STYLES.completed;
  const score = attempt.score_percentage;
  const inProgress = attempt.status === "in_progress";
  const href = inProgress ? continueHref : resultHref;

  return (
    <Card className="text-right">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-foreground">
            المحاولة {attempt.attempt_number}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              status.className
            )}
          >
            {inProgress ? (
              <Play className="size-3.5" aria-hidden />
            ) : (
              <CheckCircle2 className="size-3.5" aria-hidden />
            )}
            {status.label}
          </span>
        </div>

        {score != null ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>النتيجة</span>
              <span
                className={cn(
                  "font-bold",
                  attempt.passed ? "text-success" : "text-destructive"
                )}
              >
                {Math.round(score)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  attempt.passed ? "bg-success" : "bg-destructive/70"
                )}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {attempt.correct_count} إجابة صحيحة من {attempt.total_questions}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {attempt.total_questions} سؤال — لم تُسلَّم بعد
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            البدء:{" "}
            <span className="font-semibold text-foreground">
              {formatDateTime(attempt.started_at)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {inProgress ? "التقدم قيد الحفظ" : formatDateTime(attempt.submitted_at)}
          </span>
        </div>

        <Button asChild className="w-full rounded-xl py-4 text-base font-bold">
          <Link href={href}>
            <ArrowLeft className="rtl:rotate-180" aria-hidden />
            {inProgress ? "متابعة المحاولة" : "عرض النتيجة"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
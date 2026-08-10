import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Play,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const TYPE_ICONS: Record<string, { icon: typeof BookOpen; headerClass: string }> = {
  lesson: { icon: BookOpen, headerClass: "bg-primary" },
  unit: { icon: Layers, headerClass: "bg-primary" },
  monthly: { icon: CalendarDays, headerClass: "bg-primary" },
  semester: { icon: FileText, headerClass: "bg-primary" },
  full: { icon: Trophy, headerClass: "bg-primary" },
};

const DEFAULT_TYPE = { icon: BookOpen, headerClass: "bg-primary" };

function scoreColor(score: number | null): string {
  if (score == null) return "bg-muted";
  if (score >= 80) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-destructive";
}

/**
 * بطاقة محاولة — تُستخدم في "محاولاتي" (سجل كل المحاولات) وفي تفاصيل الامتحان.
 */
export function AttemptCard({
  attempt,
  resultHref,
  continueHref,
  index = 0,
}: {
  attempt: ExamAttemptSummary;
  resultHref: string;
  continueHref: string;
  index?: number;
}) {
  const status = STATUS_STYLES[attempt.status] ?? STATUS_STYLES.completed;
  const typeInfo =
    (attempt.exam_type != null && TYPE_ICONS[attempt.exam_type]) || DEFAULT_TYPE;
  const TypeIcon = typeInfo.icon;
  const inProgress = attempt.status === "in_progress";
  const href = inProgress ? continueHref : resultHref;
  const score = attempt.score_percentage;

  return (
    <ScrollReveal delay={index * 120}>
      <Card className="overflow-hidden text-right shadow-lg">
      <div
        className={cn(
          "flex items-center gap-3 p-4 font-bold text-primary-foreground",
          typeInfo.headerClass
        )}
      >
        <TypeIcon className="size-5 shrink-0" aria-hidden />
        <span className="flex-1 truncate">
          {attempt.exam_title ?? "محاولة"}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
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

      <div className="flex flex-col gap-4 p-5">
        {attempt.exam_type_label && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <TypeIcon className="size-3.5" aria-hidden />
            {attempt.exam_type_label}
          </span>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted p-3">
          <div className="text-center">
            <span className="block text-xs font-bold text-muted-foreground/80">
              الإجابات الصحيحة
            </span>
            <span className="mt-1 block text-base font-black text-foreground" dir="ltr">
              {attempt.correct_count} / {attempt.total_questions}
            </span>
          </div>
          <div className="border-r border-border text-center">
            <span className="block text-xs font-bold text-muted-foreground/80">
              نسبة النجاح
            </span>
            <span
              className={cn(
                "mt-1 block text-base font-black",
                score != null
                  ? attempt.passed
                    ? "text-success"
                    : "text-destructive"
                  : "text-foreground"
              )}
              dir="ltr"
            >
              {score != null ? `${Math.round(score)}%` : "---"}
            </span>
          </div>
        </div>

        {score != null && (
          <div className="space-y-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", scoreColor(score))}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground/70">
              <span>النتيجة</span>
              <span dir="ltr">{Math.round(score)}%</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            البدء:{" "}
            <span className="font-semibold text-foreground">
              {formatDateTime(attempt.started_at)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {inProgress ? "قيد الحفظ" : formatDateTime(attempt.submitted_at)}
          </span>
        </div>

        <Button
          asChild
          variant={inProgress ? "secondary" : "default"}
          className={cn(
            "w-full gap-1 rounded-2xl py-4 text-base font-bold",
            inProgress && "bg-warning text-warning-foreground hover:brightness-90"
          )}
        >
          <Link href={href}>
            <ArrowLeft className="rtl:rotate-180" aria-hidden />
            {inProgress ? "متابعة المحاولة" : "عرض النتيجة"}
          </Link>
        </Button>
      </div>
      </Card>
    </ScrollReveal>
  );
}

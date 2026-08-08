import {
  Clock,
  FileQuestion,
  Lock,
  RotateCcw,
  Trophy,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/features/student/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EXAM_TYPE_LABELS, type ExamBlueprint } from "../../types/exam.types";

function typeLabel(exam: ExamBlueprint): string {
  return exam.exam_type_label ?? EXAM_TYPE_LABELS[exam.exam_type];
}

/**
 * بطاقة امتحان في قائمة الامتحانات المتاحة للطالب.
 */
export function ExamCard({
  exam,
  href,
}: {
  exam: ExamBlueprint;
  href: string;
}) {
  const isLocked = exam.unlock_progress != null && exam.unlock_progress < 100;

  return (
    <Card
      className={cn("text-right transition-all", !exam.is_active && "opacity-70")}
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
              {typeLabel(exam)}
            </span>
            <h3 className="text-base font-bold tracking-tight text-foreground">
              {exam.title}
            </h3>
            {exam.scope_name && (
              <span className="text-xs font-medium text-muted-foreground">
                {exam.scope_name}
              </span>
            )}
          </div>
          {(!exam.is_active || exam.attempts_left === 0) && (
            <Lock
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
        </div>

        {exam.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {exam.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <FileQuestion className="size-3.5" aria-hidden />
            {exam.total_questions} سؤال
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <Clock className="size-3.5" aria-hidden />
            {exam.duration_minutes} دقيقة
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <RotateCcw className="size-3.5" aria-hidden />
            {exam.attempts_left != null
              ? `${exam.attempts_left} / ${exam.attempts_allowed} محاولات`
              : `${exam.attempts_allowed} محاولات`}
          </span>
          {exam.best_score != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-warning-foreground">
              <Trophy className="size-3.5" aria-hidden />
              أفضل نتيجة {Math.round(exam.best_score)}%
            </span>
          )}
        </div>

        {exam.unlock_progress != null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                {isLocked ? (
                  <Lock className="size-3.5" aria-hidden />
                ) : (
                  <Unlock className="size-3.5" aria-hidden />
                )}
                {isLocked
                  ? "أكمل دروس النطاق لفتح الامتحان"
                  : "الامتحان مفتوح"}
              </span>
              <span className="font-bold text-foreground">
                {Math.round(exam.unlock_progress)}%
              </span>
            </div>
            <ProgressBar value={exam.unlock_progress} className="h-2" />
          </div>
        )}

        <Button asChild className="w-full rounded-xl py-5 text-base font-bold">
          <Link href={href}>{isLocked ? "عرض النطاق" : "ادخل الامتحان"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
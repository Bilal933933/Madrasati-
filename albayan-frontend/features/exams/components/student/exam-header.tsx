import { AlarmClock, CheckCheck, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../lib/attemptFormat";

/**
 * رأس محرك الامتحان: عدّاد الوقت + تقدم الإجابات.
 */
export function ExamHeader({
  title,
  currentIndex,
  totalQuestions,
  answeredCount,
  remainingSeconds,
}: {
  title: string;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  remainingSeconds: number;
}) {
  const danger = remainingSeconds <= 120;
  const warn = !danger && remainingSeconds <= 300;

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-foreground">
          <span className="truncate">{title}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <FileQuestion className="size-4" aria-hidden />
            <span dir="ltr">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCheck className="size-4" aria-hidden />
            {answeredCount} أجيبت
          </span>
        </div>

        <div className="ms-auto">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums",
              danger
                ? "bg-destructive/15 text-destructive"
                : warn
                  ? "bg-warning/15 text-warning-foreground"
                  : "bg-muted text-foreground"
            )}
            dir="ltr"
          >
            <AlarmClock className="size-4" aria-hidden />
            {formatDuration(remainingSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
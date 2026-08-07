import { CheckCircle2, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { StudentCourseLesson } from "../types/student.types";

/**
 * صف درس داخل صفحة المقرر — رقم/علامة إكمال + العنوان + المدة + رابط /learn.
 * يُبرَز "التالي" (الدرس غير المكتمل الأول) بحدود اللون الأساسي.
 */
export function LessonRow({
  lesson,
  index,
  isNext,
}: {
  lesson: StudentCourseLesson;
  index: number;
  isNext: boolean;
}) {
  return (
    <Link
      href={`/learn/${lesson.slug}`}
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-card px-5 py-4 transition-colors hover:bg-muted/40",
        isNext ? "border-primary/50" : "border-border",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
        {lesson.completed ? (
          <CheckCircle2 className="size-5 text-green-600" aria-hidden />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-bold", isNext && "text-primary")}>{lesson.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {lesson.blocks_count} أجزاء
          {isNext && <span className="font-semibold text-primary"> · التالي</span>}
        </p>
      </div>

      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden />
        {lesson.duration} دقيقة
      </span>

      <ChevronLeft className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden />
    </Link>
  );
}

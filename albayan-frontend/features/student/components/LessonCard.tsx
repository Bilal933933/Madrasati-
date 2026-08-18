"use client";

import { BookOpen, CheckCircle2, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { cn } from "@/lib/utils";
import type { StudentCourseLesson } from "../types/student.types";

/** حالة الدرس المحسوبة لإظهار التسمية والشارة والزر المناسب. */
function lessonStatus(lesson: StudentCourseLesson): "completed" | "progress" | "start" {
  if (lesson.completed) return "completed";
  if (lesson.started_at) return "progress";
  return "start";
}

const BADGE = {
  completed: { label: "مكتمل", className: "bg-green-500/15 text-green-600" },
  progress: { label: "جارٍ الآن", className: "bg-primary/15 text-primary" },
  start: null,
} as const;

const ACTION_TEXT = {
  completed: "مراجعة الدرس",
  progress: "أكمل التعلم",
  start: "ابدأ الآن",
} as const;

/**
 * بطاقة درس شبكية بنمط بطاقات المواد الموحّدة:
 * شريط جانبي ملون + بانر صورة 16/9 + عنوان/شارة + وصف
 * + الأهداف التعليمية ظاهرة كاملة + إحصائيات + زر إجراء حبّي.
 */
export function LessonCard({
  lesson,
  index,
  isNext,
}: {
  lesson: StudentCourseLesson;
  index: number;
  isNext: boolean;
}) {
  const status = lessonStatus(lesson);
  const badge = BADGE[status];
  const outcomes = lesson.learning_objectives ?? [];
  const tint = { backgroundColor: lesson.color ?? "var(--primary)" };

  return (
    <ScrollReveal delay={index * 80}>
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-lg",
          isNext && "border-primary/30 bg-primary/5",
        )}
      >
        {/* شريط جانبي بلون الدرس */}
        <span aria-hidden className="absolute inset-y-0 start-0 w-1.5" style={tint} />

        {/* بانر الصورة */}
        <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl">
          <ExploreThumb
            image={lesson.image}
            fallbackImage="/images/lesson-fallback.jpg"
            className="size-full rounded-none"
            alt={lesson.title}
            fallback={
              <span className="flex size-full items-center justify-center bg-muted">
                {lesson.completed ? (
                  <CheckCircle2 className="size-12 text-primary" aria-hidden />
                ) : (
                  <span className="text-4xl font-bold text-muted-foreground">{index + 1}</span>
                )}
              </span>
            }
          />
        </div>

        {/* الرأس: عنوان + شارة الحالة */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("text-lg font-bold tracking-tight", isNext && "text-primary")}>
            {lesson.title}
          </h3>
          {badge && (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                badge.className,
              )}
            >
              {status === "completed" && <CheckCircle2 className="size-3" aria-hidden />}
              {badge.label}
            </span>
          )}
        </div>

        <p className="mt-3 min-h-[2.5rem] line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {lesson.summary || "شرح متكامل وتطبيق عملي على قواعد الدرس."}
        </p>

        {/* الأهداف التعليمية — ظاهرة كاملة بلا توسيع */}
        {outcomes.length > 0 && (
          <div className="mt-3 space-y-2">
            {outcomes.map((outcome, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-xl border border-border/40 bg-background/80 p-2.5 text-xs text-foreground/90"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        )}

        {/* مباعد مرن يثبّت الذيل أسفل البطاقة */}
        <div className="mt-auto" />

        {/* الذيل: إحصائيات + زر الإجراء */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5" aria-hidden />
              {lesson.blocks_count} أجزاء
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {lesson.duration} دقيقة
            </span>
          </div>

          <Link
            href={`/learn/${lesson.slug}`}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]",
              status === "completed"
                ? "border border-primary/40 text-primary hover:bg-primary/5"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {ACTION_TEXT[status]}
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}

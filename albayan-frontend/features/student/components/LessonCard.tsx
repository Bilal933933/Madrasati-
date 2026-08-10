"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
 * بطاقة درس شبكية (Grid) منسجمة مع هوية كروت المواد:
 * صورة بارزة + عنوان + وصف + شارات + فوائد تعليمية قابلة للتوسيع
 * + زر إجراء بعرض الكارت. بألوان الثيم المتكيّفة (فاتح/داكن).
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
  const [showOutcomes, setShowOutcomes] = useState(false);
  const status = lessonStatus(lesson);
  const badge = BADGE[status];
  const outcomes = lesson.learning_objectives ?? [];

  return (
    <ScrollReveal delay={index * 80}>
      <div
        className={cn(
          "flex flex-col justify-between rounded-3xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:shadow-md",
          isNext && "border-primary/30 bg-primary/5",
        )}
      >
      {/* المحتوى */}
      <div>
        {/* الرأس: صورة + عنوان + شارة */}
        <div className="mb-4 flex items-start gap-4">
          <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60">
            <ExploreThumb
              image={lesson.image}
              fallbackImage="/images/lesson-fallback.jpg"
              className="absolute inset-0 size-full rounded-none object-cover"
              alt={lesson.title}
              fallback={
                <span className="flex size-20 items-center justify-center bg-muted/40">
                  {lesson.completed ? (
                    <CheckCircle2 className="size-8 text-primary" aria-hidden />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>
                  )}
                </span>
              }
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className={cn("truncate text-lg font-bold", isNext && "text-primary")}>
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

            <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {lesson.summary || "شرح متكامل وتطبيق عملي على قواعد الدرس."}
            </p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{lesson.blocks_count} أجزاء</span>
              <span aria-hidden>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden />
                {lesson.duration} دقيقة
              </span>
            </div>
          </div>
        </div>

        {/* زر توسعة الفوائد */}
        <button
          type="button"
          onClick={() => setShowOutcomes((v) => !v)}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-background"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-primary" aria-hidden />
            الفوائد التعليمية للدرس
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", showOutcomes && "rotate-180")}
            aria-hidden
          />
        </button>

        {/* الفوائد الموسّعة */}
        {showOutcomes && outcomes.length > 0 && (
          <div className="mb-4 space-y-2">
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
      </div>

      {/* زر الإجراء — بعرض الكارت */}
      <Link
        href={`/learn/${lesson.slug}`}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors",
          status === "completed"
            ? "border border-primary/30 text-primary hover:bg-primary/5"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <PlayCircle className="size-4" aria-hidden />
        {ACTION_TEXT[status]}
      </Link>
      </div>
    </ScrollReveal>
  );
}
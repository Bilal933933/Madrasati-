"use client";

import {
  ArrowLeft,
  Clock,
  FileQuestion,
  Lock,
  Play,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EXAM_TYPE_LABELS } from "../types/exam.types";
import { useExamMyAttempts, useStartAttempt, useStudentExam } from "../hooks/useStudentExams";
import { AttemptCard } from "../components/student/attempt-card";
import type { ReactNode } from "react";

function metaChip(icon: ReactNode, children: ReactNode) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

/** تفاصيل امتحان + حالة الفتح + سجل محاولاتي + بدء/متابعة. */
export function ExamDetailPage({ examId }: { examId: number }) {
  const examQuery = useStudentExam(examId);
  const attemptsQuery = useExamMyAttempts(examId);
  const start = useStartAttempt();

  const exam = examQuery.data?.data;
  const attempts = attemptsQuery.data?.data ?? [];
  const loading = examQuery.isLoading || attemptsQuery.isLoading;

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion className="size-4" />
            </EmptyMedia>
            <EmptyTitle>الامتحان غير متاح</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>تعذّر العثور على الامتحان المطلوب.</EmptyDescription>
        </Empty>
      </div>
    );
  }

  const isLocked = exam.unlock_progress != null && exam.unlock_progress < 100;
  const outOfAttempts = exam.attempts_left === 0;
  const inactive = !exam.is_active;
  const canStart = !inactive && !isLocked && !outOfAttempts;
  const inProgressAttempt = attempts.find((a) => a.status === "in_progress") ?? null;
  const typeLabel = exam.exam_type_label ?? EXAM_TYPE_LABELS[exam.exam_type];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/exams"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="rtl:rotate-180" aria-hidden />
        كل الامتحانات
      </Link>

      <ScrollReveal>
        <Card className="text-right shadow-md">
          <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
                {typeLabel}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {exam.title}
              </h1>
              {exam.scope_name && (
                <span className="text-sm font-medium text-muted-foreground">
                  {exam.scope_name}
                </span>
              )}
            </div>
            {!canStart && !inProgressAttempt && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                <Lock className="size-3.5" aria-hidden />
                {inactive ? "غير متاح" : outOfAttempts ? "انتهت المحاولات" : "لم يُفتح بعد"}
              </span>
            )}
          </div>

          {exam.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {exam.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {metaChip(
              <FileQuestion className="size-3.5" />,
              `${exam.total_questions} سؤال`
            )}
            {metaChip(
              <Clock className="size-3.5" />,
              `${exam.duration_minutes} دقيقة`
            )}
            {metaChip(
              <RotateCcw className="size-3.5" />,
              exam.attempts_left != null
                ? `${exam.attempts_left} محاولات متبقية`
                : `${exam.attempts_allowed} محاولات`
            )}
            {exam.best_score != null &&
              metaChip(
                <Trophy className="size-3.5" />,
                `أفضل نتيجة ${Math.round(exam.best_score)}%`
              )}
            {metaChip(
              <Target className="size-3.5" aria-hidden />,
              `عتبة النجاح ${exam.pass_threshold_percent}%`
            )}
          </div>

          {exam.requires_completion && exam.unlock_progress != null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">
                  {isLocked ? "تقدمك نحو فتح الامتحان" : "الامتحان مفتوح لك"}
                </span>
                <span className="font-bold text-foreground">
                  {Math.round(exam.unlock_progress)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isLocked ? "bg-warning" : "bg-success"
                  )}
                  style={{ width: `${Math.min(100, exam.unlock_progress)}%` }}
                />
              </div>
            </div>
          )}

          <div className="border-t border-border/60 pt-4">
            {inProgressAttempt ? (
              <Button
                asChild
                className="w-full rounded-xl py-5 text-base font-bold"
              >
                <Link href={`/exams/attempt/${inProgressAttempt.id}`}>
                  <Play className="size-4" aria-hidden />
                  متابعة المحاولة الجارية
                </Link>
              </Button>
            ) : (
              <Button
                className="w-full rounded-xl py-5 text-base font-bold"
                disabled={!canStart || start.isPending}
                onClick={() => start.mutate(exam.id)}
              >
                {start.isPending ? "جارٍ التحضير…" : "ابدأ الامتحان"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      </ScrollReveal>

      <ScrollReveal className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border/60 to-transparent" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">
          محاولاتي ({attempts.length})
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </ScrollReveal>

      {attempts.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RotateCcw className="size-4" />
            </EmptyMedia>
            <EmptyTitle>لا توجد محاولات بعد</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            ابدأ محاولتك الأولى لتظهر نتائجها هنا.
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {attempts.map((attempt, index) => (
            <AttemptCard
              key={attempt.id}
              attempt={attempt}
              index={index}
              resultHref={`/exams/result/${attempt.id}`}
              continueHref={`/exams/attempt/${attempt.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
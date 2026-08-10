"use client";

import { History, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMyAttemptsHistory } from "../hooks/useStudentExams";
import { EXAM_TYPE_LABELS } from "../types/exam.types";
import type { ExamType } from "../types/exam.types";
import type { ExamAttemptSummary } from "../types/attempt.types";
import { AttemptCard } from "../components/student/attempt-card";
import { AttemptStatsBar } from "../components/student/attempt-stats-bar";

const TYPE_OPTIONS: { value: ExamType | null; label: string }[] = [
  { value: null, label: "الكل" },
  { value: "lesson", label: EXAM_TYPE_LABELS.lesson },
  { value: "unit", label: EXAM_TYPE_LABELS.unit },
  { value: "monthly", label: EXAM_TYPE_LABELS.monthly },
  { value: "semester", label: EXAM_TYPE_LABELS.semester },
  { value: "full", label: EXAM_TYPE_LABELS.full },
];

function getGroupKey(dateStr: string | null): string {
  const date = new Date(dateStr ?? "");
  if (Number.isNaN(date.getTime())) return "أقدم";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays <= 7) return "هذا الأسبوع";
  if (diffDays <= 30) return "هذا الشهر";
  if (diffDays <= 60) return "الشهر الماضي";
  return "أقدم";
}

const GROUP_ORDER = ["اليوم", "هذا الأسبوع", "هذا الشهر", "الشهر الماضي", "أقدم"];

/** سجل كل محاولاتي — إحصائيات + بحث + فلترة بالنوع + تجميع زمني. */
export function StudentAttemptsHistory() {
  const { data, isLoading, isError } = useMyAttemptsHistory();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ExamType | null>(null);

  const attempts = useMemo(() => data?.data ?? [], [data]);
  const stats = data?.stats;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attempts.filter((a) => {
      if (type !== null && a.exam_type !== type) return false;
      if (!q) return true;
      return (a.exam_title ?? "").toLowerCase().includes(q);
    });
  }, [attempts, search, type]);

  const inProgress = useMemo(
    () => filtered.filter((a) => a.status === "in_progress"),
    [filtered]
  );

  const grouped = useMemo(() => {
    const completed = filtered.filter((a) => a.status !== "in_progress");
    const groups: Record<string, ExamAttemptSummary[]> = {};
    for (const attempt of completed) {
      const key = getGroupKey(attempt.started_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(attempt);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
    );
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasAttempts = attempts.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <ScrollReveal>
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            محاولاتي
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            سجل جميع محاولاتك السابقة عبر الامتحانات.
          </p>
        </header>
      </ScrollReveal>

      {stats && (
        <ScrollReveal>
          <AttemptStatsBar stats={stats} />
        </ScrollReveal>
      )}

      {hasAttempts && (
        <>
          <ScrollReveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الامتحان..."
                className="h-9 pr-8"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
              {TYPE_OPTIONS.map((option) => {
                const isActive = type === option.value;
                return (
                  <button
                    key={option.value ?? "all"}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={cn(
                      "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          </ScrollReveal>

          {filtered.length === 0 ? (
            <Empty className="border-dashed py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History className="size-4" />
                </EmptyMedia>
                <EmptyTitle>لا توجد محاولات مطابقة</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>
                  جرّب تغيير كلمة البحث أو اختيار نوع آخر.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-6">
              {inProgress.length > 0 && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                    قيد التنفيذ
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {inProgress.map((attempt, index) => (
                      <AttemptCard
                        key={attempt.id}
                        attempt={attempt}
                        index={index}
                        resultHref={`/exams/result/${attempt.id}`}
                        continueHref={`/exams/attempt/${attempt.id}`}
                      />
                    ))}
                  </div>
                </section>
              )}

              {grouped.map(([groupName, groupAttempts]) => (
                <section key={groupName}>
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {groupName}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {groupAttempts.map((attempt, index) => (
                      <AttemptCard
                        key={attempt.id}
                        attempt={attempt}
                        index={index}
                        resultHref={`/exams/result/${attempt.id}`}
                        continueHref={`/exams/attempt/${attempt.id}`}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      {!hasAttempts && (
        <Empty className="border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="size-4" />
            </EmptyMedia>
            <EmptyTitle>لا توجد محاولات بعد</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>
              {isError
                ? "تعذّر تحميل سجل المحاولات. حاول مرة أخرى لاحقًا."
                : "ابدأ امتحانًا لتظهر محاولاتك هنا."}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

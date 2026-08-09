"use client";

import { Medal, Sparkles } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentAchievements } from "../hooks/useStudentAchievements";
import { AchievementCard } from "../components/student/achievement-card";

/** صفحة "إنجازاتي" — كل الأوسمة مع التقدم وحالة الفتح. */
export function StudentAchievementsPage() {
  const { data, isLoading, isError, refetch } = useStudentAchievements();
  const items = data?.data ?? [];
  const unlockedCount = items.filter((item) => item.unlocked).length;
  const total = items.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Medal className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              إنجازاتي
            </h1>
            <p className="text-sm text-muted-foreground">
              كل وسم تفتحه يبقى ثابتًا في صفحتك.
            </p>
          </div>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">{unlockedCount}</span>
          <span className="text-muted-foreground">من</span>
          <span className="font-semibold text-muted-foreground">{total}</span>
        </div>
      </header>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-8 py-16 text-center text-muted-foreground">
          تعذّر تحميل الإنجازات.
        </p>
      ) : items.length === 0 ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Medal />
            </EmptyMedia>
            <EmptyTitle>لا توجد إنجازات بعد</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>
              لم يُضف المشرف أوسمة بعد. عد لاحقًا.
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
}
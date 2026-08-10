"use client";

import { BookCheck, GraduationCap, Medal, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompletedLessons } from "@/features/student/hooks/useCompletedLessons";
import { useMyAttemptsHistory } from "@/features/exams/hooks/useStudentExams";
import { useStudentAchievements } from "@/features/achievements/hooks/useStudentAchievements";
import { ResultsStatsBar } from "../components/results-stats-bar";
import { CompletedLessonsSection } from "../components/completed-lessons-section";
import { ExamsSection } from "../components/exams-section";
import { AchievementsSection } from "../components/achievements-section";

/**
 * لوحة "نتائجي" — شاملة: سجل الدروس المكتملة + محاولات الامتحانات + الإنجازات،
 * بتبويبات تعرض كل قسم مع إحصائيات موحّدة في الأعلى.
 */
export function MyResultsPage() {
  const lessons = useCompletedLessons();
  const attempts = useMyAttemptsHistory();
  const achievements = useStudentAchievements();

  const isLoading = lessons.isLoading || attempts.isLoading || achievements.isLoading;
  const isError = lessons.isError || attempts.isError || achievements.isError;

  const completedItems = lessons.data?.data ?? [];
  const attemptItems = attempts.data?.data ?? [];
  const achievementItems = achievements.data?.data ?? [];

  const stats = {
    lessonsTotal: lessons.data?.stats.total ?? completedItems.length,
    subjectsCount: lessons.data?.stats.subjects_count ?? 0,
    examsCompleted: attempts.data?.stats.completed ?? 0,
    examsAverage: attempts.data?.stats.average_percentage ?? null,
    achievementsUnlocked: achievementItems.filter((item) => item.unlocked).length,
    achievementsTotal: achievementItems.length,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6">
      <ScrollReveal>
        <header className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Trophy className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                نتائجي
              </h1>
              <p className="text-sm text-muted-foreground">
                تقدمك في الدروس والامتحانات والإنجازات — كل ذلك في مكان واحد.
              </p>
            </div>
          </div>
        </header>
      </ScrollReveal>

      {isLoading ? (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-6 h-72 rounded-2xl" />
        </div>
      ) : isError ? (
        <p className="mt-8 py-16 text-center text-muted-foreground">
          تعذّر تحميل النتائج. حاول مرة أخرى لاحقًا.
        </p>
      ) : (
        <ScrollReveal className="mt-6">
          <ResultsStatsBar stats={stats} />
        </ScrollReveal>
      )}

      {!isLoading && !isError && (
        <ScrollReveal className="mt-8">
          <Tabs defaultValue="lessons" dir="rtl">
            <TabsList className="h-10 w-full gap-1 sm:w-fit">
              <TabsTrigger value="lessons" className="gap-1.5">
                <BookCheck className="size-4" aria-hidden />
                الدروس
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-1.5">
                <GraduationCap className="size-4" aria-hidden />
                الامتحانات
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-1.5">
                <Medal className="size-4" aria-hidden />
                الإنجازات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="mt-6">
              <CompletedLessonsSection items={completedItems} />
            </TabsContent>
            <TabsContent value="exams" className="mt-6">
              <ExamsSection attempts={attemptItems} />
            </TabsContent>
            <TabsContent value="achievements" className="mt-6">
              <AchievementsSection items={achievementItems} />
            </TabsContent>
          </Tabs>
        </ScrollReveal>
      )}
    </div>
  );
}

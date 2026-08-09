"use client";

import Link from "next/link";
import { Medal } from "lucide-react";
import { useStudentAchievements } from "../../hooks/useStudentAchievements";
import { ProgressBar } from "@/features/student/components/progress-bar";

/** ملخص الإنجازات في بيت الطالب — عدد المفتوح + شريط + رابط للمسار الكامل. */
export function AchievementsHomeCard() {
  const { data, isLoading } = useStudentAchievements();
  const items = data?.data ?? [];
  const unlockedCount = items.filter((item) => item.unlocked).length;
  const total = items.length;
  const percent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  if (isLoading) return null;

  return (
    <Link
      href="/achievements"
      className="mt-3 block rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/30 hover:bg-card"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm">
          <Medal className="size-4 text-primary" aria-hidden />
          <span className="font-medium text-foreground">إنجازاتك</span>
        </span>
        {total > 0 && (
          <span className="text-xs font-semibold text-primary">
            {unlockedCount} / {total}
          </span>
        )}
        {total === 0 && (
          <span className="text-xs text-muted-foreground">قريبًا</span>
        )}
      </div>
      {total > 0 && (
        <ProgressBar value={percent} className="mt-3 h-1.5" />
      )}
    </Link>
  );
}
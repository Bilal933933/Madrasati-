import { BookCheck, GraduationCap, Medal, Target } from "lucide-react";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

interface ResultsStats {
  lessonsTotal: number;
  subjectsCount: number;
  examsCompleted: number;
  examsAverage: number | null;
  achievementsUnlocked: number;
  achievementsTotal: number;
}

/** شريط إحصائيات لوحة "نتائجي" — دروس مكتملة، مواد، امتحانات، إنجازات. */
export function ResultsStatsBar({ stats }: { stats: ResultsStats }) {
  const items = [
    {
      icon: BookCheck,
      label: "دروس مكتملة",
      value: String(stats.lessonsTotal),
    },
    {
      icon: GraduationCap,
      label: "مواد",
      value: String(stats.subjectsCount),
    },
    {
      icon: Target,
      label: "امتحانات مكتملة",
      value: String(stats.examsCompleted),
    },
    {
      icon: Medal,
      label: "إنجازات مفتوحة",
      value: `${stats.achievementsUnlocked} / ${stats.achievementsTotal}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item, index) => (
        <ScrollReveal key={item.label} delay={index * 120}>
          <div className="rounded-xl border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <item.icon className="size-3.5" aria-hidden />
              <span>{item.label}</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
            {item.label === "امتحانات مكتملة" && stats.examsAverage !== null && (
              <p className="mt-0.5 text-[11px] text-muted-foreground" dir="ltr">
                متوسط {Math.round(stats.examsAverage)}%
              </p>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

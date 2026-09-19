"use client";

import {
  GraduationCap,
  Users,
  BookOpen,
  Library,
  CheckCircle2,
  FileCheck2,
  Trophy,
  Percent,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsSummary } from "@/features/analytics/hooks/useAnalytics";
import type { AnalyticsCounts } from "@/features/analytics/types/analytics.types";

const CHART_CONFIG: ChartConfig = {
  completed_lessons: {
    label: "دروس مكتملة",
    color: "hsl(var(--primary))",
  },
  exam_attempts: {
    label: "محاولات امتحانات",
    color: "var(--chart-2)",
  },
};

function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1).toLocaleDateString("ar-EG", {
    month: "short",
    year: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">
          {typeof value === "number" ? value.toLocaleString("ar-EG") : value}
          {suffix ? (
            <span className="ms-1 text-sm font-normal text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function StatCardsGrid({ counts }: { counts: AnalyticsCounts }) {
  const stats: {
    icon: typeof Users;
    label: string;
    value: number;
    suffix?: string;
    hint?: string;
  }[] = [
    {
      icon: Users,
      label: "الطلاب",
      value: counts.students,
      hint: `${counts.teachers} معلم`,
    },
    {
      icon: BookOpen,
      label: "الدروس",
      value: counts.lessons,
      hint: `${counts.courses} مقرر`,
    },
    {
      icon: CheckCircle2,
      label: "دروس مكتملة",
      value: counts.completed_lessons,
      hint: "إجمالي عمليات الإكمال",
    },
    {
      icon: Percent,
      label: "نسبة إكمال الدروس",
      value: counts.completion_rate_percent,
      suffix: "%",
      hint: "لكل طالب في كل درس",
    },
    {
      icon: FileCheck2,
      label: "محاولات الامتحانات",
      value: counts.exam_attempts,
      hint: `${counts.exams_passed} ناجحة`,
    },
    {
      icon: GraduationCap,
      label: "متوسط الدرجات",
      value: counts.avg_score_percent,
      suffix: "%",
      hint: "للمحاولات المكتملة",
    },
    {
      icon: Trophy,
      label: "الإنجازات المفتوحة",
      value: counts.achievements_unlocked,
      hint: `مقابل ${counts.students} طالب`,
    },
    {
      icon: Library,
      label: "المشرفون",
      value: counts.admins,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalyticsSummary();
  const summary = data?.data;

  if (isLoading || !summary) {
    return (
      <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="الإحصائيات" description="مؤشرات النشاط والتقدّم على المنصة." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="الإحصائيات"
        description="مؤشرات النشاط والتقدّم على المنصة — يتم تحديثها لحظيًا."
      />

      <StatCardsGrid counts={summary.counts} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">النشاط الشهري (آخر ١٢ شهرًا)</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.monthly.length > 0 ? (
            <ChartContainer config={CHART_CONFIG} className="h-80 w-full">
              <BarChart
                accessibilityLayer
                data={summary.monthly.map((item) => ({
                  ...item,
                  monthLabel: formatMonth(item.month),
                }))}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="completed_lessons" fill="var(--color-completed_lessons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exam_attempts" fill="var(--color-exam_attempts)" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              لا توجد بيانات نشاط بعد — ابدأ بالدراسة أولًا.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
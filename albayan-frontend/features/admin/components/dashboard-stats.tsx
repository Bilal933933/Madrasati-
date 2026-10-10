"use client";

import { FileCheck2, FileText, Percent, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsSummary } from "@/features/analytics/hooks/useAnalytics";
import type { AnalyticsCounts } from "@/features/analytics/types/analytics.types";

function formatNumber(value: number): string {
  return value.toLocaleString("ar-EG");
}

function StatPill({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <Card className="py-3">
      <CardContent className="flex items-center gap-3 px-4 py-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-semibold leading-tight tabular-nums">
            {value}
            {suffix ? (
              <span className="ms-1 text-xs font-normal text-muted-foreground">
                {suffix}
              </span>
            ) : null}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {label}
          </span>
        </span>
      </CardContent>
    </Card>
  );
}

/**
 * شريط عدّادات لوحة الأدمن — يُغذّى من /api/admin/analytics/summary.
 * عند الفشل يُخفى الشريط كاملًا (لا رسالة خطأ كاذبة)، وعند التحميل هياكل عظمية.
 */
export function DashboardStats() {
  const { data, isPending, isError } = useAnalyticsSummary();

  if (isError) return null;

  if (isPending || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-[68px] rounded-xl" />
        ))}
      </div>
    );
  }

  const counts: AnalyticsCounts = data.data.counts;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatPill icon={Users} label="طالب مسجّل" value={formatNumber(counts.students)} />
      <StatPill icon={FileText} label="درس منشور" value={formatNumber(counts.lessons)} />
      <StatPill
        icon={FileCheck2}
        label="محاولة امتحان مكتملة"
        value={formatNumber(counts.exam_attempts)}
      />
      <StatPill
        icon={Percent}
        label="نسبة الإتقان العامة"
        value={formatNumber(counts.completion_rate_percent)}
        suffix="٪"
      />
    </div>
  );
}

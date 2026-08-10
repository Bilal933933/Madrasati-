import { BarChart3, BookCheck, Clock, Play } from "lucide-react";
import type { AttemptStats } from "../../types/attempt.types";

/**
 * شريط إحصائيات سجل المحاولات: الإجمالي، المكتملة، قيد التنفيذ، متوسط النتيجة.
 */
export function AttemptStatsBar({ stats }: { stats: AttemptStats }) {
  if (stats.total === 0) {
    return null;
  }

  const items = [
    { icon: BarChart3, label: "إجمالي المحاولات", value: String(stats.total) },
    { icon: BookCheck, label: "مكتملة", value: String(stats.completed) },
    { icon: Play, label: "قيد التنفيذ", value: String(stats.in_progress) },
    ...(stats.average_percentage !== null
      ? [
          {
            icon: Clock,
            label: "متوسط النتيجة",
            value: `${Math.round(stats.average_percentage)}%`,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <item.icon className="size-3.5" aria-hidden />
            <span>{item.label}</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

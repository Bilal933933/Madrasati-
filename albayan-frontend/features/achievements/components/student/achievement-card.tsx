import { cn } from "@/lib/utils";
import { ProgressBar } from "@/features/student/components/progress-bar";
import { AchievementIcon } from "../../lib/achievementIcons";
import type { AchievementProgress } from "../../types/achievement.types";

/** بطاقة إنجاز للطالب — حالة الفتح تلوّنها، والقفل يعرض التقدم نحو العتبة. */
export function AchievementCard({ item }: { item: AchievementProgress }) {
  const progressPct =
    item.threshold > 0
      ? Math.round((item.progress / item.threshold) * 100)
      : 0;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4",
        item.unlocked
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-card/60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            item.unlocked
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground/70"
          )}
        >
          <AchievementIcon name={item.icon} className="size-5" />
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {item.metric_label}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className={cn("text-sm font-semibold", !item.unlocked && "text-muted-foreground")}>
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>

      {item.unlocked ? (
        <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          مفتوح
        </span>
      ) : (
        <div className="flex flex-col gap-1.5 pt-1">
          <ProgressBar value={progressPct} className="h-1.5" />
          <span className="text-[11px] text-muted-foreground">
            {item.progress} / {item.threshold}
          </span>
        </div>
      )}
    </div>
  );
}
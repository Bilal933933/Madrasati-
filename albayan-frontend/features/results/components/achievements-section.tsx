import { Medal } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AchievementCard } from "@/features/achievements/components/student/achievement-card";
import type { AchievementProgress } from "@/features/achievements/types/achievement.types";

/** قسم الإنجازات في "نتائجي" — يستعير بطاقة الإنجاز من دومين الإنجازات. */
export function AchievementsSection({ items }: { items: AchievementProgress[] }) {
  if (items.length === 0) {
    return (
      <Empty className="border-dashed py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Medal className="size-4" />
          </EmptyMedia>
          <EmptyTitle>لا توجد إنجازات بعد</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُضف المشرف أوسمة بعد. عد لاحقًا.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <AchievementCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}

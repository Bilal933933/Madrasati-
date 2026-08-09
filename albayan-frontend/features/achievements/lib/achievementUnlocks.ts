import { createElement } from "react";
import { Medal } from "lucide-react";
import { toast } from "sonner";
import type { AchievementDefinition } from "../types/achievement.types";

/**
 * إشعار الأوسمة المفتوحة حديثًا — تُستلم من استجابات إكمال الدرس
 * أو تسليم الاختبار (unlocked_achievements). تظهر كموست لكل وسم.
 */
export function notifyUnlockedAchievements(
  list?: AchievementDefinition[] | null
): void {
  if (!list || list.length === 0) return;

  for (const achievement of list) {
    toast.success(achievement.title, {
      description: achievement.description ?? achievement.metric_label,
      icon: createElement(Medal, { className: "size-4 text-primary" }),
    });
  }
}
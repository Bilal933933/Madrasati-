import { createElement } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Crown,
  Flame,
  Footprints,
  Medal,
  Rocket,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * حلّ أيقونات الأوسمة المخزّنة كنص (أسماء lucide-react) إلى مكوّنات فعلية،
 * مع سقوط آمن إلى Medal لأي اسم غير معروف.
 */
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  Sprout,
  Trophy,
  BadgeCheck,
  BookOpen,
  Target,
  Flame,
  Medal,
  Award,
  Star,
  Crown,
  Zap,
  Sparkles,
  Rocket,
  Footprints,
};

export function AchievementIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ACHIEVEMENT_ICONS[name]) || Medal;
  return createElement(Icon, { className, "aria-hidden": true });
}
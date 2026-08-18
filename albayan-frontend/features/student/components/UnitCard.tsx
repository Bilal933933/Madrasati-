import { BookOpen, CheckCircle2, ChevronLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import type { ProgressStatus, StudentUnit } from "../types/student.types";

const BADGE: Record<ProgressStatus, { label: string; className: string } | null> = {
  completed: { label: "مكتمل", className: "bg-green-500/15 text-green-600" },
  in_progress: { label: "جارٍ الآن", className: "bg-primary/15 text-primary" },
  not_started: null,
};

const ACTION_TEXT: Record<ProgressStatus, string> = {
  completed: "راجع",
  in_progress: "أكمل التعلم",
  not_started: "ابدأ الآن",
};

/** شارة التقدم بلون/خلفية شفافة من لون المقرر المخزّن. */
function tintStyle(color: string | null): { backgroundColor?: string; color?: string } {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    return { backgroundColor: `${color}1f`, color };
  }
  return {};
}

/**
 * بطاقة مقرر بنمط بطاقة الدرس الموحّد:
 * شريط جانبي ملون + بانر صورة 16/9 + عنوان/شارة + وصف
 * + تقدم للمقررات الجارية + إحصائيات + زر إجراء حبّي.
 */
export function UnitCard({
  unit,
  subjectSlug,
  index,
  isCurrent = false,
}: {
  unit: StudentUnit;
  subjectSlug: string;
  index: number;
  isCurrent?: boolean;
}) {
  const Icon = EXPLORE_ICONS[unit.icon ?? ""] ?? GraduationCap;
  const badge = BADGE[unit.status];
  const tint = tintStyle(unit.color);
  const locked = unit.total_count === 0 || !unit.slug;

  return (
    <ScrollReveal delay={index * 80}>
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-lg",
          isCurrent && "border-primary/30 bg-primary/5",
        )}
      >
        {/* شريط جانبي بلون المقرر */}
        <span aria-hidden className="absolute inset-y-0 start-0 w-1.5" style={tint} />

        {/* بانر الصورة */}
        <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl">
          <ExploreThumb
            image={unit.image}
            fallbackImage="/images/subject-fallback.jpg"
            className="size-full rounded-none"
            alt={unit.name}
            fallback={
              <span className="flex size-full items-center justify-center bg-muted" style={tint}>
                <Icon className="size-12" aria-hidden />
              </span>
            }
          />
        </div>

        {/* الرأس: عنوان + شارة الحالة */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("text-lg font-bold tracking-tight", isCurrent && "text-primary")}>
            {unit.name}
          </h3>
          {badge && (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                badge.className,
              )}
            >
              {unit.status === "completed" && <CheckCircle2 className="size-3" aria-hidden />}
              {badge.label}
            </span>
          )}
        </div>

        <p className="mt-3 min-h-[2.5rem] line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {unit.description}
        </p>

        {/* التقدم للمقرر الجاري */}
        {unit.status === "in_progress" && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">التقدم</span>
              <span className="font-bold text-primary">{unit.progress}%</span>
            </div>
            <ProgressBar value={unit.progress} className="h-2" />
          </div>
        )}

        {/* مباعد مرن يثبّت الذيل أسفل البطاقة */}
        <div className="mt-auto" />

        {/* الذيل: إحصائيات + زر الإجراء */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5" aria-hidden />
              {unit.total_count} دروس
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" aria-hidden />
              {unit.completed_count} مكتمل
            </span>
          </div>

          {locked ? (
            <span className="rounded-full bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">
              سيتم الإضافة قريبًا
            </span>
          ) : (
            <Link
              href={`/home/subject/${subjectSlug}/course/${unit.slug}`}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]",
                unit.status === "completed"
                  ? "border border-primary/40 text-primary hover:bg-primary/5"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {ACTION_TEXT[unit.status]}
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

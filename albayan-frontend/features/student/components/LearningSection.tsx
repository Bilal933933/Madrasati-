import { CheckCircle2, ChevronLeft, Layers, PlayCircle, Repeat } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import type { LessonPreview, ProgressStatus } from "../types/student.types";

export interface LearningSectionProps {
  /** رقم المقطع — يحدد اتجاه تناوب الصورة (زوجي يمين/فردي يسار). */
  index: number;
  title: string;
  tagline: string;
  image: string | null;
  icon: string | null;
  progress: number;
  status: ProgressStatus;
  lastLesson: LessonPreview | null;
  nextLesson: LessonPreview | null;
  lastVisitedAt: string | null;
  isCurrentItem?: boolean;
  badge?: string;
  stats: { value: string | number; label: string }[];
  /** وجهة زر الإجراء — تُخفي الزر إن كانت فارغة. */
  href: string;
}

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: arSA });
  } catch {
    return null;
  }
}

function actionLabel(status: ProgressStatus): string {
  if (status === "completed") return "راجع";
  if (status === "in_progress") return "أكمل التعلم";
  return "ابدأ الآن";
}

/**
 * قسم تعلم (مادة في بيت الطالب أو مقرر في صفحة المادة) بنمط التصميم:
 * شريط علوي بالشارات + جسم بعمودين (صورة | محتوى) + آخر/قادم درس + شريط
 * تقدم + إحصائيات + زر إجراء يتغيّر حسب الحالة. بألوان الثيم فقط.
 */
export function LearningSection({
  index,
  title,
  tagline,
  image,
  icon,
  progress,
  status,
  lastLesson,
  nextLesson,
  lastVisitedAt,
  isCurrentItem = false,
  badge,
  stats,
  href,
}: LearningSectionProps) {
  const isEven = index % 2 === 0;
  const Icon = EXPLORE_ICONS[icon ?? ""] ?? Layers;
  const visited = relativeTime(lastVisitedAt);

  return (
    <section className="group overflow-hidden rounded-3xl border bg-card">
      {/* الشريط العلوي */}
      <div className="flex flex-wrap items-center gap-2.5 border-b bg-muted/40 px-5 py-3 sm:px-6">
        <h2 className="font-bold">{title}</h2>

        {isCurrentItem && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-current" />
            جارٍ الآن
          </span>
        )}

        {badge && (
          <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {badge}
          </span>
        )}

        {status === "completed" && (
          <span className="ms-auto flex items-center gap-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-4" />
            مكتمل
          </span>
        )}

        {visited && (
          <span className="ms-auto text-xs text-muted-foreground">آخر زيارة: {visited}</span>
        )}
      </div>

      {/* جسم بعمودين */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* الصورة */}
        <div
          className={cn(
            "relative min-h-64 overflow-hidden bg-muted lg:min-h-80",
            isEven ? "lg:order-2" : "lg:order-1",
          )}
        >
          <ExploreThumb
            image={image}
            className="absolute inset-0 size-full rounded-none transition-transform duration-700 group-hover:scale-105"
            alt={title}
            fallback={
              <span className="absolute inset-0 flex items-center justify-center">
                <Icon className="size-16 text-primary" aria-hidden />
              </span>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

          {/* شارة التقدم */}
          {status !== "not_started" && (
            <div className="absolute end-4 top-4 rounded-xl border bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
              {status === "completed" ? (
                <span className="flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-primary" />
                </span>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black leading-none">{progress}%</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">مكتمل</span>
                </div>
              )}
            </div>
          )}

          {/* غطاء لم تبدأ */}
          {status === "not_started" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 backdrop-blur-sm">
              <PlayCircle className="size-10 text-primary" aria-hidden />
              <span className="text-sm font-bold text-muted-foreground">لم تبدأ بعد</span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div
          className={cn(
            "flex flex-col justify-between gap-5 p-6 sm:p-8",
            isEven ? "lg:order-1" : "lg:order-2",
          )}
        >
          <div>
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tagline}</p>
          </div>

          {/* آخر / قادم درس */}
          {(lastLesson || nextLesson) && (
            <div className="flex flex-col gap-2">
              {lastLesson && (
                <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3">
                  <Repeat className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="mb-0.5 text-xs font-semibold text-primary">آخر درس</p>
                    <p className="text-sm font-bold">{lastLesson.title}</p>
                  </div>
                </div>
              )}
              {nextLesson && status !== "completed" && (
                <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3">
                  <PlayCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
                      {status === "not_started" ? "أول درس" : "الدرس القادم"}
                    </p>
                    <p className="text-sm font-bold">{nextLesson.title}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* شريط التقدم */}
          {status === "in_progress" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">التقدم</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}

          {/* الإحصائيات */}
          <div className="flex items-center gap-5 border-y border-border py-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-5">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-black">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                {i < stats.length - 1 && <div className="h-8 w-px self-center bg-border" />}
              </div>
            ))}
          </div>

          {/* زر الإجراء */}
          {href ? (
            <Link
              href={href}
              className={cn(
                "flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-base font-bold transition-all duration-200 active:scale-[0.98]",
                status === "completed"
                  ? "border-2 border-primary text-primary hover:bg-primary/5"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {actionLabel(status)}
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          ) : (
            <p className="w-full rounded-2xl border border-dashed px-5 py-3.5 text-center text-sm text-muted-foreground">
              لا توجد دروس منشورة بعد
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

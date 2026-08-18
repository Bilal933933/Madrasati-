import { BookOpen, CheckCircle2, ChevronLeft, Layers } from "lucide-react";
import Link from "next/link";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import type { StudentSubject } from "../types/student.types";

function actionLabel(status: StudentSubject["status"]): string {
  if (status === "completed") return "راجع";
  if (status === "in_progress") return "أكمل التعلم";
  return "ابدأ الآن";
}

/** خلفية/لون شفافان من لون المادة المخزّن، أو تدرّج الأساسي إن لم يكن صالحًا. */
function tintStyle(color: string | null): { backgroundColor?: string; color?: string } {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    return { backgroundColor: `${color}1f`, color };
  }
  return {};
}

/**
 * بطاقة مادة غنية في بيت الطالب:
 * شريط جانبي بلون المادة + أيقونة + Badge عدد الدروس + وصف مقصوص سطرين
 * + تقدم للمواد الجارية + إحصائيات بأيقونات + زر إجراء سياقي.
 * حالة مقفلة عند غياب الدروس (0) تعرض "سيتم الإضافة قريبًا".
 */
export function SubjectCard({ subject }: { subject: StudentSubject }) {
  const Icon = EXPLORE_ICONS[subject.icon ?? ""] ?? Layers;
  const tint = tintStyle(subject.color);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-lg">
      {/* شريط جانبي يمثل المادة */}
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-1.5"
        style={{ backgroundColor: subject.color ?? "var(--primary)" }}
      />

      {/* صورة المادة — أو صورة بديلة عند غيابها */}
      <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl">
        <ExploreThumb
          image={subject.image}
          fallbackImage="/images/subject-fallback.jpg"
          className="size-full rounded-none"
          alt={subject.name}
          fallback={
            <span
              className="flex size-full items-center justify-center bg-muted text-primary"
              style={tint}
            >
              <Icon className="size-10" aria-hidden />
            </span>
          }
        />
      </div>

      {/* الرأس: أيقونة + اسم + عدد الدروس */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            style={tint}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <h3 className="text-lg font-bold tracking-tight">{subject.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {subject.lessons_count} {subject.lessons_count === 1 ? "درس" : "دروس"}
        </span>
      </div>

      {/* الوصف: مقصوص سطرين لتوحيد الارتفاع */}
      <p className="mt-3 min-h-[2.5rem] line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {subject.description}
      </p>

      {/* التقدم للمادة الجارية */}
      {subject.status === "in_progress" && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">التقدم</span>
            <span className="font-bold text-primary">{subject.progress}%</span>
          </div>
          <ProgressBar value={subject.progress} className="h-2" />
        </div>
      )}

      {/* مباعد مرن يثبّت الذيل أسفل البطاقة */}
      <div className="mt-auto" />

      {/* الذيل: إحصائيات + زر الإجراء */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" aria-hidden />
            {subject.units_count} وحدات
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
            {subject.progress}% مكتمل
          </span>
        </div>

        {subject.lessons_count === 0 ? (
          <span className="rounded-full bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">
            سيتم الإضافة قريبًا
          </span>
        ) : (
          <Link
            href={`/home/subject/${subject.slug}`}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]",
              subject.status === "completed"
                ? "border border-primary/40 text-primary hover:bg-primary/5"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {actionLabel(subject.status)}
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

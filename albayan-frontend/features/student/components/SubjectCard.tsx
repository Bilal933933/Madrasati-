import { BookOpen, CheckCircle2, FileText, GraduationCap } from "lucide-react";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { IconBox, PillButton, SectionTitle } from "./subject-primitives";
import type { ProgressStatus, StudentSubject } from "../types/student.types";

const STATUS_BADGE: Record<ProgressStatus, { label: string; className: string } | null> = {
  completed: { label: "مكتملة", className: "bg-success/10 text-success" },
  in_progress: { label: "جارية", className: "bg-primary/10 text-primary" },
  not_started: null,
};

function tintStyle(color: string | null): { backgroundColor?: string; color?: string } {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    return { backgroundColor: `${color}1f`, color };
  }
  return {};
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-3 text-end">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

/**
 * بطاقة مادة بلوحتين (محتوى ثم تفاصيل) حسب التصميم المرجعي.
 * عرض فقط — بلا منطق أعمال.
 */
export function SubjectCard({
  subject,
  gradeName,
  semesterName,
}: {
  subject: StudentSubject;
  gradeName: string;
  semesterName: string;
}) {
  const Icon = EXPLORE_ICONS[subject.icon ?? ""] ?? GraduationCap;
  const tint = tintStyle(subject.color);
  const locked = subject.lessons_count === 0;
  const badge = STATUS_BADGE[subject.status];
  const subjectHref = `/home/subject/${subject.slug}`;

  return (
    <article
      aria-labelledby={`subject-title-${subject.id}`}
      className="grid grid-cols-1 overflow-hidden border border-border/60 bg-card shadow-sm lg:grid-cols-[1.15fr_1fr]"
      style={{ borderRadius: "var(--subject-card-radius)" }}
    >
      {/* لوحة المحتوى — بداية السطر */}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{ borderRadius: "var(--subject-cover-radius)", minHeight: "230px" }}
        >
          <ExploreThumb
            image={subject.image}
            fallbackImage="/images/subject-fallback.jpg"
            className="absolute inset-0 size-full rounded-none object-cover"
            alt={`غلاف مادة ${subject.name}`}
            fallback={
              <span className="absolute inset-0 flex items-center justify-center bg-primary/10" style={tint}>
                <Icon className="size-16" aria-hidden />
              </span>
            }
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconBox label={`أيقونة مادة ${subject.name}`}>
              <Icon className="size-6" aria-hidden />
            </IconBox>
            <div>
              <h2 id={`subject-title-${subject.id}`} className="text-[1.375rem] font-bold text-foreground text-balance">
                {subject.name}
              </h2>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            مادة أساسية
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">التقدم في المادة</span>
            <span className="font-bold text-primary tabular-nums">{subject.progress}% مكتمل</span>
          </div>
          <div
            role="progressbar"
            aria-label={`التقدم في مادة ${subject.name}`}
            aria-valuenow={subject.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2"
          >
            <ProgressBar value={subject.progress} className="h-[10px]" />
          </div>
        </div>
      </div>

      {/* لوحة التفاصيل — نهاية السطر */}
      <div className="flex flex-col gap-4 border-t border-border/60 bg-muted/40 p-5 sm:p-6 lg:border-s lg:border-t-0">
        <SectionTitle icon={<FileText className="size-4" aria-hidden />}>تفاصيل المادة</SectionTitle>

        <p className="text-[13px] leading-relaxed text-muted-foreground text-pretty">{subject.description}</p>

        <dl className="grid grid-cols-2 gap-3">
          <StatCell label="الفصل الدراسي" value={semesterName} />
          <StatCell label="الصف" value={gradeName} />
          <StatCell label="الوحدات" value={String(subject.units_count)} />
          <StatCell label="الاختبارات" value={String(subject.lessons_count)} />
        </dl>

        <div className="mt-auto grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
          <PillButton href={subjectHref} tone="primary" ariaLabel={`ابدأ التعلم في ${subject.name}`} disabled={locked}>
            ابدأ التعلم
          </PillButton>
          <PillButton href={subjectHref} tone="secondary" ariaLabel={`وحدات ${subject.name}`} disabled={locked}>
            الوحدات
          </PillButton>
          <PillButton href={subjectHref} tone="info" ariaLabel={`فتح مادة ${subject.name}`} disabled={locked}>
            فتح المادة
          </PillButton>
          <PillButton href="/exams" tone="warning" ariaLabel={`اختبارات ${subject.name}`} disabled={locked}>
            الاختبارات
          </PillButton>
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 pt-3 text-sm">
          <span className="font-semibold text-foreground">الحالة:</span>
          {locked ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              سيتم الإضافة قريبًا
            </span>
          ) : badge ? (
            <span className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", badge.className)}>
              {subject.status === "completed" && <CheckCircle2 className="size-3" aria-hidden />}
              {badge.label}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <BookOpen className="size-3" aria-hidden />
              لم تبدأ بعد
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/** هيكل تحميل بنفس شبكة البطاقة. */
export function SubjectCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="جارٍ تحميل المادة"
      className="grid grid-cols-1 overflow-hidden border border-border/60 bg-card lg:grid-cols-[1.15fr_1fr]"
      style={{ borderRadius: "var(--subject-card-radius)" }}
    >
      <div className="flex animate-pulse flex-col gap-4 p-5 sm:p-6">
        <div className="w-full bg-muted" style={{ borderRadius: "var(--subject-cover-radius)", minHeight: "230px" }} />
        <div className="h-6 w-2/3 rounded-full bg-muted" />
        <div className="h-2.5 w-full rounded-full bg-muted" />
      </div>
      <div className="flex animate-pulse flex-col gap-4 border-t border-border/60 bg-muted/40 p-5 sm:p-6 lg:border-s lg:border-t-0">
        <div className="h-5 w-1/3 rounded-full bg-muted" />
        <div className="h-16 w-full rounded-xl bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

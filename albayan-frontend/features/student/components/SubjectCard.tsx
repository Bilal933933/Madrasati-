import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  Layers,
  Play,
  Sparkles,
} from "lucide-react";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { ProgressBar } from "./progress-bar";
import { GhostButton, PillButton } from "./subject-primitives";
import type { ProgressStatus, StudentSubject } from "../types/student.types";

const STATUS_LABEL: Record<ProgressStatus, string> = {
  completed: "مكتملة",
  in_progress: "قيد التقدم",
  not_started: "لم تبدأ بعد",
};

function tintStyle(color: string | null): { backgroundColor?: string; color?: string } {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    return { backgroundColor: `${color}1f`, color };
  }
  return {};
}

function Tile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] bg-muted px-3.5 py-2.5 text-muted-foreground max-sm:flex-col max-sm:items-start max-sm:gap-1 max-sm:px-2.5">
      <span aria-hidden className="size-[18px] shrink-0 [&>svg]:size-full">
        {icon}
      </span>
      <div>
        <b className="block text-lg font-semibold leading-tight text-foreground tabular-nums">{value}</b>
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
}

/**
 * بطاقة المادة: غلاف جانبي (صورة + شارة حالة + تقدم مصغر) ومتن
 * (ترويسة + بلاطات + تقدم + الدرس التالي + إجراءات).
 * Server Component: عرض فقط — بلا منطق أعمال.
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
  const subjectHref = `/home/subject/${subject.slug}`;

  const statusLabel = locked ? "سيتم الإضافة قريبًا" : STATUS_LABEL[subject.status];
  const primaryTitle = locked
    ? "سيتم الإضافة قريبًا"
    : subject.status === "completed"
      ? "راجع المادة"
      : subject.status === "in_progress"
        ? "تابع التعلم"
        : "ابدأ التعلم";

  return (
    <article
      aria-labelledby={`subject-title-${subject.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row"
    >
      {/* الغلاف — بداية السطر */}
      <div className="relative h-[150px] w-full flex-none bg-muted sm:h-auto sm:w-60">
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
        <span className="absolute start-3 top-3 rounded-full border border-border bg-background/85 px-3 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
          {statusLabel}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30" aria-hidden>
          <div className="h-full bg-primary" style={{ width: `${subject.progress}%` }} />
        </div>
      </div>

      {/* المتن */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6">
        <header className="flex items-center gap-3.5">
          <span
            aria-hidden
            className="grid size-[46px] flex-none place-items-center rounded-xl bg-primary/10 text-primary"
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={`subject-title-${subject.id}`} className="text-xl font-semibold leading-snug text-foreground text-balance">
              {subject.name}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {gradeName} · {semesterName}
            </p>
          </div>
          <span className="ms-auto shrink-0 rounded-full border border-border bg-primary/10 px-3 py-0.5 text-xs font-medium whitespace-nowrap text-primary">
            آخر ما درسته
          </span>
        </header>

        <div className="grid grid-cols-3 gap-2.5 max-sm:gap-2">
          <Tile label="وحدات" value={String(subject.units_count)} icon={<Layers aria-hidden />} />
          <Tile label="درسًا" value={String(subject.lessons_count)} icon={<BookOpen aria-hidden />} />
          <Tile label="مكتملة" value={String(subject.completed_count)} icon={<CheckCircle2 aria-hidden />} />
        </div>

        <div>
          <div
            role="progressbar"
            aria-label={`التقدم في مادة ${subject.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={subject.progress}
          >
            <ProgressBar value={subject.progress} className="h-1.5" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>التقدم في المادة</span>
            <span className="font-semibold text-foreground tabular-nums">{subject.progress}%</span>
          </div>
        </div>

        {!locked && subject.next_lesson ? (
          <Link
            href={`/learn/${subject.next_lesson.slug}`}
            aria-label={`الدرس التالي في ${subject.name}: ${subject.next_lesson.title}`}
            className="flex items-center gap-2.5 rounded-[10px] border border-border px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Play className="size-[18px] shrink-0 text-primary" aria-hidden />
            <span className="truncate">
              الدرس التالي: <b className="font-medium text-foreground">{subject.next_lesson.title}</b>
            </span>
          </Link>
        ) : (
          !locked &&
          subject.status === "completed" && (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-border px-3.5 py-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="size-[18px] shrink-0 text-primary" aria-hidden />
              <span>
                أكملت جميع دروس <b className="font-medium text-foreground">{subject.name}</b>
              </span>
            </div>
          )
        )}

        <footer className="mt-auto flex items-center gap-2.5 border-t border-border pt-4 max-sm:flex-wrap">
          <GhostButton
            href="/exams"
            ariaLabel={`عرض اختبارات ${subject.name}`}
            disabled={locked}
            className="max-sm:flex-1"
          >
            <FileQuestion className="size-[18px]" aria-hidden />
            الامتحانات
          </GhostButton>
          <GhostButton
            href="/ai-tutor"
            ariaLabel={`المعلم الذكي لمادة ${subject.name}`}
            disabled={locked}
            className="max-sm:flex-1"
          >
            <Sparkles className="size-[18px]" aria-hidden />
            المعلم الذكي
          </GhostButton>
          <PillButton
            href={subjectHref}
            tone="hero"
            size="bar"
            ariaLabel={`${primaryTitle} في ${subject.name}`}
            disabled={locked}
            className="ms-auto max-sm:order-[-1] max-sm:ms-0 max-sm:flex-[1_1_100%]"
          >
            {primaryTitle}
            <ArrowLeft className="size-[18px]" aria-hidden />
          </PillButton>
        </footer>
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
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row"
    >
      <div className="h-[150px] w-full flex-none animate-pulse bg-muted sm:h-auto sm:w-60" />
      <div className="flex flex-1 animate-pulse flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="size-[46px] flex-none rounded-xl bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-40 rounded-full bg-muted" />
            <div className="h-4 w-28 rounded-full bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="h-16 rounded-[10px] bg-muted" />
          <div className="h-16 rounded-[10px] bg-muted" />
          <div className="h-16 rounded-[10px] bg-muted" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted" />
        <div className="h-11 w-full rounded-[10px] bg-muted" />
        <div className="flex gap-2.5 border-t border-border pt-4">
          <div className="h-10 flex-1 rounded-[10px] bg-muted" />
          <div className="h-10 flex-1 rounded-[10px] bg-muted" />
          <div className="h-10 flex-1 rounded-[10px] bg-muted" />
        </div>
      </div>
    </div>
  );
}

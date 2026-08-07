import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { LearningSection } from "../components/LearningSection";
import { ProgressBar } from "../components/progress-bar";
import type { StudentSubjectDetail } from "../types/student.types";

function QuickStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function StatDivider() {
  return <div className="w-px self-stretch bg-border" />;
}

/**
 * صفحة المادة للطالب — غلاف المادة مع تقدمها وإحصائياتها + المقرر الحالي
 * + أقسام مقرراتها (LearningSection) بتقدم كل مقرر وزر يقود لأول درس فيه.
 */
export function StudentSubjectPage({ subject }: { subject: StudentSubjectDetail }) {
  const currentUnit = subject.units.find((unit) => unit.status === "in_progress");
  const completedUnits = subject.units.filter((unit) => unit.status === "completed").length;
  const Icon = EXPLORE_ICONS[subject.icon ?? ""] ?? GraduationCap;

  return (
    <div>
      {/* زر رجوع */}
      <div className="mb-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          المواد
        </Link>
      </div>

      {/* غلاف المادة */}
      <header className="overflow-hidden rounded-3xl border bg-card">
        <div className="relative h-44 overflow-hidden bg-muted sm:h-56">
          <ExploreThumb
            image={subject.image}
            className="absolute inset-0 size-full rounded-none object-cover"
            alt={subject.name}
            fallback={
              <span className="absolute inset-0 flex items-center justify-center bg-muted">
                <Icon className="size-16 text-muted-foreground" aria-hidden />
              </span>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-6 pb-5 sm:px-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Icon className="size-7" aria-hidden />
            </span>
            <div>
              <p className="mb-0.5 text-xs font-semibold text-white/75">
                {subject.grade.name} · {subject.semester.name}
              </p>
              <h1 className="text-3xl font-black leading-tight text-white">{subject.name}</h1>
            </div>
          </div>
        </div>

        {/* التقدم والإحصائيات */}
        <div className="px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">تقدمك في المادة</span>
                <span className="text-xl font-black text-primary">{subject.progress}%</span>
              </div>
              <ProgressBar value={subject.progress} />
            </div>

            <div className="flex items-center gap-6">
              <QuickStat value={subject.units_count} label="وحدات" />
              <StatDivider />
              <QuickStat value={subject.lessons_count} label="دروس" />
              <StatDivider />
              <QuickStat value={completedUnits} label="مكتمل" />
            </div>
          </div>

          {currentUnit && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-semibold text-primary">
                المقرر الحالي: {currentUnit.name}
                {currentUnit.next_lesson ? ` · ${currentUnit.next_lesson.title}` : ""}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* فاصل */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">مقررات {subject.name}</p>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* المقررات */}
      {subject.units.length > 0 ? (
        <div className="flex flex-col gap-6">
          {subject.units.map((unit, index) => (
            <LearningSection
              key={unit.id}
              index={index}
              title={unit.name}
              tagline={unit.description}
              image={unit.image}
              icon={unit.icon}
              progress={unit.progress}
              status={unit.status}
              lastLesson={unit.last_lesson}
              nextLesson={unit.next_lesson}
              lastVisitedAt={unit.last_visited_at}
              isCurrentItem={currentUnit?.id === unit.id}
              stats={[
                { value: unit.total_count, label: "دروس" },
                { value: unit.completed_count, label: "مكتمل" },
              ]}
              href={unit.slug ? `/home/subject/${subject.slug}/course/${unit.slug}` : ""}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          لا توجد مقررات منشورة في هذه المادة بعد.
        </p>
      )}
    </div>
  );
}

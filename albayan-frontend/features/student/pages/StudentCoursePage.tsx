import { ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { LessonRow } from "../components/LessonRow";
import { ProgressBar } from "../components/progress-bar";
import type { StudentCourseDetail } from "../types/student.types";

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

/** صفحة المقرر للطالب — رأس المقرر + تقدمه + قائمة الدروس بحالة كل درس. */
export function StudentCoursePage({
  course,
  subjectSlug,
}: {
  course: StudentCourseDetail;
  subjectSlug: string;
}) {
  const Icon = EXPLORE_ICONS[course.icon ?? ""] ?? Layers;
  const nextLessonId = course.next_lesson?.id ?? null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/home/subject/${subjectSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          {course.subject.name}
        </Link>
      </div>

      <header className="overflow-hidden rounded-3xl border bg-card">
        <div className="relative h-44 overflow-hidden bg-muted sm:h-52">
          <ExploreThumb
            image={course.image}
            alt={course.name}
            className="absolute inset-0 size-full rounded-none object-cover"
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
              <p className="mb-0.5 text-xs font-semibold text-white/75">{course.subject.name}</p>
              <h1 className="text-3xl font-black leading-tight text-white">{course.name}</h1>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8">
          {course.description && (
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
          )}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">تقدمك في المقرر</span>
                <span className="text-xl font-black text-primary">{course.progress}%</span>
              </div>
              <ProgressBar value={course.progress} />
            </div>
            <div className="flex items-center gap-6">
              <QuickStat value={course.total_count} label="دروس" />
              <StatDivider />
              <QuickStat value={course.completed_count} label="مكتمل" />
            </div>
          </div>
        </div>
      </header>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">دروس {course.name}</p>
        <div className="h-px flex-1 bg-border" />
      </div>

      {course.lessons.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {course.lessons.map((lesson, index) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={index}
              isNext={lesson.id === nextLessonId}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">لا توجد دروس منشورة في هذا المقرر بعد.</p>
      )}
    </div>
  );
}
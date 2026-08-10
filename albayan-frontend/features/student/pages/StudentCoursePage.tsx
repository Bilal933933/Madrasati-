import { ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { LessonCard } from "../components/LessonCard";
import { ProgressBar } from "../components/progress-bar";
import type { StudentCourseDetail } from "../types/student.types";

/** صفحة المقرر للطالب — رأس انسيابي (Mobile-First) + تقدمه + قائمة الدروس. */
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6">
      <div className="mb-8">
        <Link
          href={`/home/subject/${subjectSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          {course.subject.name}
        </Link>
      </div>

      {/* غلاف المقرر — Mobile-First: عمود واحد في الموبايل، عمودان من lg */}
      <ScrollReveal className="relative overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* المحتوى والبيانات — يمين (بداية RTL) */}
          <div className="flex flex-col lg:col-span-5">
            <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
              {course.subject.name}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              {course.name}
            </h1>
            {course.description && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {course.description}
              </p>
            )}

            {/* كتلة التقدم والبيانات */}
            <div className="mt-6 space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">تقدمك في المقرر</span>
                <span className="font-bold text-primary">{course.progress}%</span>
              </div>
              <ProgressBar value={course.progress} className="h-2" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{course.total_count}</span> دروس
                </span>
                <span aria-hidden className="text-muted-foreground/50">•</span>
                <span>
                  <span className="font-semibold text-foreground">{course.completed_count}</span> مكتمل
                </span>
              </div>
            </div>
          </div>

          {/* طبقة الصورة — بطاقة مدمجة في الموبايل، خلفية متلاشية من lg */}
          <div className="relative col-span-1 aspect-[16/9] w-full overflow-hidden rounded-2xl lg:aspect-auto lg:col-span-7 lg:h-96 lg:rounded-none">
            <ExploreThumb
              image={course.image}
              fallbackImage="/images/subject-fallback.jpg"
              alt={course.name}
              className="absolute inset-0 size-full rounded-none object-cover"
              fallback={
                <span className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Icon className="size-16 text-muted-foreground" aria-hidden />
                </span>
              }
            />
            {/* تلاشٍ خفيف عند الحافة السفلية فقط */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/60 to-transparent lg:h-24 lg:from-background" />
            {/* تلاشٍ أفقي خفيف إلى الخلفية على الشاشات الكبيرة فقط */}
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent to-background lg:block" />
          </div>
        </div>
      </ScrollReveal>

      {/* فاصل ناعم بالتدرج بدل الخط الصلب */}
      <ScrollReveal className="mt-14 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border/60 to-transparent" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">دروس {course.name}</p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </ScrollReveal>

      {course.lessons.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {course.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              isNext={lesson.id === nextLessonId}
            />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-muted-foreground">لا توجد دروس منشورة في هذا المقرر بعد.</p>
      )}
    </div>
  );
}
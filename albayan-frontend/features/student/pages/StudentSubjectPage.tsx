import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { LearningSection } from "../components/LearningSection";
import { ProgressBar } from "../components/progress-bar";
import type { StudentSubjectDetail } from "../types/student.types";

/**
 * صفحة المادة للطالب — نمط Open Canvas انسيابي بلا بطاقات/فواصل صلبة:
 * غلاف عائم بعمق تدرّجي وتوهج خلفي + إحصاءات نصية رشيقة + مقررات
 * متباعدة عموديًا دون إطارات. بألوان الثيم فقط (فاتح/داكن).
 */
export function StudentSubjectPage({ subject }: { subject: StudentSubjectDetail }) {
  const currentUnit = subject.units.find((unit) => unit.status === "in_progress");
  const completedUnits = subject.units.filter((unit) => unit.status === "completed").length;
  const Icon = EXPLORE_ICONS[subject.icon ?? ""] ?? GraduationCap;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6">
      {/* زر رجوع */}
      <div className="mb-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          المواد
        </Link>
      </div>

      {/* غلاف المادة — Hero: يمين=نص (5) | يسار=صورة متلاشية (7) */}
      <ScrollReveal className="relative overflow-hidden">
        {/* طبقة التوهج العائم */}
        <div className="pointer-events-none absolute end-1/3 top-10 size-72 rounded-full bg-primary/15 opacity-40 blur-3xl" />

        {/* Mobile-First: عمود واحد في الموبايل، عمودان من lg */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* المحتوى والبيانات — يمين (بداية RTL) */}
          <div className="flex flex-col lg:col-span-5">
            <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
              {subject.grade.name} · {subject.semester.name}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              {subject.name}
            </h1>
            {subject.description ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {subject.description}
              </p>
            ) : null}

            {/* كتلة التقدم والبيانات */}
            <div className="mt-6 space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">تقدمك في المادة</span>
                <span className="font-bold text-primary">{subject.progress}%</span>
              </div>
              <ProgressBar value={subject.progress} className="h-2" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{subject.units_count}</span> وحدات
                </span>
                <span aria-hidden className="text-muted-foreground/50">•</span>
                <span>
                  <span className="font-semibold text-foreground">{subject.lessons_count}</span> دروس
                </span>
                <span aria-hidden className="text-muted-foreground/50">•</span>
                <span>
                  <span className="font-semibold text-foreground">{completedUnits}</span> مكتمل
                </span>
              </div>
            </div>

            {/* المقرر الحالي */}
            {currentUnit && (
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span>
                  المقرر الحالي:{" "}
                  <span className="font-semibold text-foreground">{currentUnit.name}</span>
                  {currentUnit.next_lesson ? ` · ${currentUnit.next_lesson.title}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* طبقة الصورة — بطاقة مدمجة في الموبايل، خلفية متلاشية من lg */}
          <div className="relative col-span-1 aspect-[16/9] w-full overflow-hidden rounded-2xl lg:aspect-auto lg:col-span-7 lg:h-96 lg:rounded-none">
            <ExploreThumb
              image={subject.image}
              fallbackImage="/images/subject-fallback.jpg"
              className="absolute inset-0 size-full rounded-none object-cover"
              alt={subject.name}
              fallback={
                <span className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Icon className="size-24 text-muted-foreground" aria-hidden />
                </span>
              }
            />
            {/* تلاشٍ خفيف عند الحافة السفلية فقط (لا يغطي منتصف الصورة) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/60 to-transparent lg:h-24 lg:from-background" />
            {/* تلاشٍ أفقي خفيف إلى الخلفية على الشاشات الكبيرة فقط */}
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent to-background lg:block" />
          </div>
        </div>
      </ScrollReveal>

      {/* فاصل ناعم بالتدرج بدل الخط الصلب */}
      <ScrollReveal className="mt-14 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border/60 to-transparent" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">مقررات {subject.name}</p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </ScrollReveal>

      {/* المقررات */}
      {subject.units.length > 0 ? (
        <div className="mt-10 flex flex-col gap-14">
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
        <p className="py-20 text-center text-muted-foreground">
          لا توجد مقررات منشورة في هذه المادة بعد.
        </p>
      )}
    </div>
  );
}
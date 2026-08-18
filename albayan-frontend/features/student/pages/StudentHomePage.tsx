import { ChevronLeft, GraduationCap, Hand, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { AchievementsHomeCard } from "@/features/achievements/components/student/achievements-home-card";
import { SubjectCard } from "../components/SubjectCard";
import { ProgressBar } from "../components/progress-bar";
import type { StudentHomeData } from "../types/student.types";

/**
 * بيت الطالب — نفس نمط غلاف صفحة المادة (Hero):
 * توهّج عائم + شارة الصف/الفصل + كتلة تقدم ناعمة في العمود النصي،
 * وصورة الصف بجانبه في طبقة متلاشية. ثم فاصل متدرّج + مواد.
 */
export function StudentHomePage({ data }: { data: StudentHomeData }) {
  const current =
    data.subjects.find(
      (s) => s.status === "in_progress" && (s.next_lesson || s.last_lesson),
    ) ??
    data.subjects.find((s) => s.status === "not_started" && s.next_lesson) ??
    null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6">
      {/* غلاف البيت — Hero: يمين=نص (5) | يسار=صورة الصف المتلاشية (7) */}
      <ScrollReveal className="relative overflow-hidden">
        <div className="pointer-events-none absolute end-1/3 top-10 size-72 rounded-full bg-primary/15 opacity-40 blur-3xl" />

        {/* Mobile-First: عمود واحد في الموبايل، عمودان من lg */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* المحتوى والبيانات — يمين (بداية RTL) */}
          <div className="flex flex-col lg:col-span-5">
            <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
              {data.grade.name} · {data.semester.name} · {data.academic_year}
            </span>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              السلام عليكم، {data.student.name}{" "}
              <Hand className="inline size-8 align-text-bottom text-primary" aria-hidden />
            </h1>

            {/* كتلة التقدم — بنمط المرجع الناعم */}
            <div className="mt-6 space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">تقدمك الكلي هذا الفصل</span>
                <span className="font-bold text-primary">{data.overall_progress}%</span>
              </div>
              <ProgressBar value={data.overall_progress} className="h-2" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" aria-hidden />
                  <span className="font-semibold text-foreground">{data.subjects.length}</span> مادة
                  متاحة
                </span>
              </div>
            </div>

            {/* ملخص الإنجازات — بطاقة مدمجة ترتبط بصفحة الإنجازات */}
            <AchievementsHomeCard />
          </div>

          {/* طبقة صورة الصف — بطاقة مدمجة في الموبايل، خلفية متلاشية من lg */}
          <div className="relative col-span-1 aspect-[16/9] w-full overflow-hidden rounded-2xl lg:aspect-auto lg:col-span-7 lg:h-96 lg:rounded-none">
            <ExploreThumb
              image={data.grade.image}
              fallbackImage="/images/subject-fallback.jpg"
              className="absolute inset-0 size-full rounded-none object-cover"
              alt={data.grade.name}
              fallback={
                <span className="absolute inset-0 flex items-center justify-center bg-muted">
                  <GraduationCap className="size-24 text-muted-foreground" aria-hidden />
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

      {/* الدرس التالي (البطل) — الخطوة التالية مباشرة، حسب المرجع 5.1 */}
      {current && (
        <ScrollReveal className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
                  خطوتك التالية
                </span>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                  {current.status === "in_progress"
                    ? (current.next_lesson?.title ?? current.last_lesson?.title)
                    : current.next_lesson?.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {current.name}
                  {current.status === "in_progress"
                    ? ` · التقدم ${current.progress}%`
                    : " · جاهزة للبدء"}
                </p>
                {current.status === "in_progress" && (
                  <ProgressBar value={current.progress} className="mt-2 h-2 max-w-xs" />
                )}
              </div>
              <Link
                href={`/home/subject/${current.slug}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
              >
                {current.status === "in_progress" ? "أكمل التعلم" : "ابدأ الآن"}
                <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* فاصل ناعم بالتدرج بدل الخط الصلب */}
      <ScrollReveal className="mt-14 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border/60 to-transparent" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">موادك</p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </ScrollReveal>

      {data.subjects.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {data.subjects.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} index={index} />
          ))}
        </div>
      ) : (
        <p className="mt-14 py-16 text-center text-muted-foreground">
          لا توجد مواد متاحة لك هذا الفصل بعد.
        </p>
      )}
    </div>
  );
}
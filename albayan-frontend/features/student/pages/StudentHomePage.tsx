import { CalendarDays, GraduationCap, Hand, TrendingUp } from "lucide-react";
import { LearningSection } from "../components/LearningSection";
import { ProgressBar } from "../components/progress-bar";
import type { StudentHomeData } from "../types/student.types";

/**
 * بيت الطالب — صفحة «ما الذي سأدرسه اليوم؟» بنمط مركز التعلم الشخصي:
 * هيدر بالترحيب وشارات الصف/الفصل + بطاقة التقدم الكلي + فواصل + أقسام
 * مواد متناوبة (LearningSection) مرتبة بأولوية الطالب.
 */
export async function StudentHomePage({ data }: { data: StudentHomeData }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      {/* الهيدر */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          السلام عليكم، {data.student.name}{" "}
          <Hand className="inline size-7 align-text-bottom text-primary" aria-hidden />
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <GraduationCap className="size-4" />
            {data.grade.name}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CalendarDays className="size-4" />
            {data.semester.name}
          </span>
          <span className="text-sm text-muted-foreground/70">{data.academic_year}</span>
        </p>
      </header>

      {/* بطاقة التقدم الكلي */}
      <div className="mb-10 flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground">تقدمك الكلي هذا الفصل</p>
          <div className="mt-2">
            <span className="text-4xl font-black">{data.overall_progress}%</span>
          </div>
          <ProgressBar value={data.overall_progress} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">{data.subjects.length} مادة متاحة</p>
        </div>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TrendingUp className="size-7" aria-hidden />
        </span>
      </div>

      {/* فاصل */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">موادك</p>
        <div className="h-px flex-1 bg-border" />
      </div>

      {data.subjects.length > 0 ? (
        <div className="flex flex-col gap-6">
          {data.subjects.map((subject, index) => (
            <LearningSection
              key={subject.id}
              index={index}
              title={subject.name}
              tagline={subject.description}
              image={subject.image}
              icon={subject.icon}
              progress={subject.progress}
              status={subject.status}
              lastLesson={subject.last_lesson}
              nextLesson={subject.next_lesson}
              lastVisitedAt={subject.last_visited_at}
              isCurrentItem={index === 0 && subject.status === "in_progress"}
              badge={
                index === 0 && subject.status !== "in_progress"
                  ? "آخر مادة استكشفتها"
                  : undefined
              }
              stats={[
                { value: subject.units_count, label: "وحدات" },
                { value: subject.lessons_count, label: "دروس" },
                { value: subject.completed_count, label: "مكتمل" },
              ]}
              href={`/home/subject/${subject.slug}`}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          لا توجد مواد متاحة لك هذا الفصل بعد.
        </p>
      )}
    </div>
  );
}

"use client";

import { ArrowLeft, BookOpen, GraduationCap, ListChecks, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import { useLessonProgress } from "@/features/lesson-engine/hooks/useLessonProgress";

/**
 * شاشة البداية — استقبال الطالب: غلاف ملوّن/صورة، اسم الدرس، الأهداف،
 * إحصاءات الرحلة، ثم [ابدأ]. تعرض زر استئناف إذا وُجد تقدم محفوظ للدرس،
 * وزر إعادة عند إتمامه. لا تعرض تفاصيل الكتل أبدًا؛ كل ما تراه مُشتق
 * من بيانات الـ Builder.
 */
export function StartStage() {
  const data = useLessonEngineStore((s) => s.data);
  const flow = useLessonEngineStore((s) => s.flow);
  const next = useLessonEngineStore((s) => s.next);
  const jumpTo = useLessonEngineStore((s) => s.jumpTo);

  const lessonId = data?.lessonId ?? 0;
  const { lastStepId, hasProgress, isCompleted, percent, clear } = useLessonProgress(lessonId);

  const title = data?.title ?? "درس جديد";
  const subject = data?.subject;
  const course = data?.course;
  const objectives = data?.objectives ?? [];
  const image = data?.image;
  const color = data?.color;

  const canResume = hasProgress && !isCompleted && lastStepId && lastStepId !== "start";

  const paragraphCount = flow.filter(
    (step) =>
      step.screen === "content" &&
      step.content?.type === "content" &&
      step.content.data.kind === "paragraph"
  ).length;
  const videoCount = flow.filter(
    (step) =>
      step.screen === "content" &&
      step.content?.type === "content" &&
      step.content.data.kind === "lesson_video"
  ).length;
  const assessmentCount = flow.filter((step) => step.screen === "assessment").length;

  const handleStart = () => {
    if (isCompleted) {
      // إعادة الدرس من جديد بعد إتمامه: نمسح التقدم السابق ونبدأ من البداية.
      clear();
    }
    next();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* الغلاف — همة بصرية فوق المحتوى */}
      <Cover image={image} color={color} title={title} subject={subject} course={course} />

      {objectives.length > 0 && (
        <section>
          <h3 className="mb-2 text-base font-semibold">بعد هذا الدرس ستكون قادرًا على:</h3>
          <ul className="flex flex-col gap-1.5">
            {objectives.map((objective, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-xl bg-muted/40 px-4 py-2.5 text-sm"
              >
                <span aria-hidden className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-3 gap-3">
        <Stat icon={BookOpen} label="فقرات" value={paragraphCount} />
        <Stat icon={ListChecks} label="تقييمات" value={assessmentCount} />
        <Stat icon={PlayCircle} label="فيديو" value={videoCount > 0 ? videoCount : 0} />
      </section>

      {canResume && (
        <Button
          size="lg"
          variant="outline"
          className="h-12 w-full text-base"
          onClick={() => jumpTo(lastStepId)}
        >
          استئناف من حيث توقفت ({percent}%)
        </Button>
      )}

      <Button size="lg" className="h-12 w-full text-base" onClick={handleStart}>
        {isCompleted ? "إعادة الدرس" : "ابدأ الدرس"}
        <ArrowLeft className="size-5" aria-hidden />
      </Button>
    </div>
  );
}

function Cover({
  image,
  color,
  title,
  subject,
  course,
}: {
  image: string | null | undefined;
  color: string | null | undefined;
  title: string;
  subject?: string;
  course?: string;
}) {
  const accent = color ?? "#8A5E38";

  // صورة تدعم تجاوز الحاوية وتُظهر توهّجًا في الجانب.
  if (image) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <ExploreThumb
          image={image}
          fallbackImage="/images/lesson-fallback.jpg"
          className="aspect-[16/9] w-full object-cover"
          alt={title}
          fallback={<CoverFallback accent={accent} title={title} />}
        />
        <CoverLabel subject={subject} course={course} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: accent }}>
      <CoverGradient accent={accent} />
      <div className="relative flex aspect-[16/9] flex-col items-center justify-center gap-3 px-6 text-center text-white">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <GraduationCap className="size-9" aria-hidden />
        </span>
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        {(subject || course) && (
          <p className="text-sm opacity-90">{[subject, course].filter(Boolean).join(" · ")}</p>
        )}
      </div>
      <CoverLabel subject={subject} course={course} />
    </div>
  );
}

function CoverGradient({ accent }: { accent: string }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -end-16 size-56 rounded-full bg-white/15 blur-3xl"
        style={{ backgroundColor: accent }}
      />
    </>
  );
}

function CoverFallback({ accent, title }: { accent: string; title: string }) {
  return (
    <div
      className="flex aspect-[16/9] w-full items-center justify-center"
      style={{ backgroundColor: accent }}
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <GraduationCap className="size-9" aria-hidden />
      </span>
      <span className="sr-only">{title}</span>
    </div>
  );
}

function CoverLabel({ subject, course }: { subject?: string; course?: string }) {
  if (!subject && !course) {
    return null;
  }
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-center text-[0.7rem] font-medium text-white/90">
      {[subject, course].filter(Boolean).join(" · ")}
    </span>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/40 px-2 py-3 text-center">
      <Icon className="size-4 text-primary" aria-hidden />
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
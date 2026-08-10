"use client";

import { ArrowLeft, GraduationCap, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
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

  const handleStart = () => {
    if (isCompleted) {
      // إعادة الدرس من جديد بعد إتمامه: نمسح التقدم السابق ونبدأ من البداية.
      clear();
    }
    next();
  };

  return (
    <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
      {/* نص البداية + نداء ابدأ */}
      <ScrollReveal className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
          <PlayCircle className="size-3.5" aria-hidden />
          درس تفاعلي جديد
        </span>
        <h1 className="text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {(subject || course) && (
          <p className="text-sm font-medium text-muted-foreground">
            {[subject, course].filter(Boolean).join(" · ")}
          </p>
        )}

        {objectives.length > 0 && (
          <section className="flex flex-col gap-1.5">
            <h3 className="mb-1 text-sm font-semibold">بعد هذا الدرس ستكون قادرًا على:</h3>
            <ul className="flex flex-col gap-1.5">
              {objectives.map((objective, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {canResume && (
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full text-base sm:w-auto"
            onClick={() => jumpTo(lastStepId)}
          >
            استئناف من حيث توقفت ({percent}%)
          </Button>
        )}

        <Button size="lg" className="h-13 w-full text-base sm:w-auto" onClick={handleStart}>
          {isCompleted ? "إعادة الدرس" : "ابدأ الدرس"}
          <ArrowLeft className="size-5" aria-hidden />
        </Button>
      </ScrollReveal>

      {/* الغلاف — همية بصرية في الجهة المقابلة */}
      <ScrollReveal delay={150}>
        <Cover image={image} color={color} title={title} subject={subject} course={course} />
      </ScrollReveal>
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

  // صورة تدعم تجاوب الحاوية وتُظهر توهّجًا في الجانب.
  if (image) {
    return (
      <div className="relative h-full min-h-64 overflow-hidden rounded-2xl">
        <ExploreThumb
          image={image}
          fallbackImage="/images/lesson-fallback.jpg"
          className="absolute inset-0 size-full object-cover"
          alt={title}
          fallback={<CoverFallback accent={accent} title={title} />}
        />
        <CoverLabel subject={subject} course={course} />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-64 overflow-hidden rounded-2xl" style={{ backgroundColor: accent }}>
      <CoverGradient accent={accent} />
      <div className="relative flex h-full min-h-64 flex-col items-center justify-center gap-3 px-6 text-center text-white">
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
      className="flex h-full min-h-64 w-full items-center justify-center"
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
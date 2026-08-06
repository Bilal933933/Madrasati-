"use client";

import { ArrowLeft } from "lucide-react";
import { BookOpen, ListChecks, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import { useLessonProgress } from "@/features/lesson-engine/hooks/useLessonProgress";

/**
 * شاشة البداية — استقبال الطالب: اسم الدرس، الأهداف، إحصاءات الرحلة، ثم [ابدأ].
 * تعرض زر استئناف إذا وُجد تقدم محفوظ للدرس، وزر إعادة عند إتمامه.
 * لا تعرض تفاصيل الكتل أبدًا؛ كل ما تراه مُشتق من بيانات الـ Builder.
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
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {subject && course ? `${subject} · ${course}` : (subject ?? course)}
        </p>
        <h2 className="mt-1 text-3xl font-bold leading-tight">{title}</h2>
      </div>

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

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/40 px-2 py-3 text-center">
      <Icon className="size-4 text-primary" aria-hidden />
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

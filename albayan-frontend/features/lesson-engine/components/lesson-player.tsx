"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLessonFlow } from "@/features/lesson-engine/hooks/useLessonFlow";
import { useLessonProgressSync } from "@/features/lesson-engine/hooks/useLessonProgressSync";
import { useLessonProgress } from "@/features/lesson-engine/hooks/useLessonProgress";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import { mapLesson } from "@/features/lesson-engine/engine/lesson-mapper";
import { stageRenderer } from "@/features/lesson-engine/engine/stage-renderer";
import { PHASE_LABEL } from "@/features/lesson-engine/engine/journey";
import { LessonShell } from "@/features/lesson-engine/components/lesson-shell";
import { getErrorMessage } from "@/lib/apiErrors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LessonPlayerProps {
  lessonSlug: string;
  /** استدعاء عند إنهاء الرحلة (العودة إلى قائمة الدروس). */
  onFinish?: () => void;
}

/**
 * Player الدرس: يجلب الرحلة، يبنيها (Mapper)، يهيّئ المحرك، ثم يرسم
 * الشاشة الحالية من سجل الشاشات (4 شاشات) داخل إطار LessonShell.
 * لا يعرف المحرك ترتيبًا ولا يعرض تفاصيل كتل للطالب.
 */
export function LessonPlayer({ lessonSlug, onFinish }: LessonPlayerProps) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useLessonFlow(lessonSlug);
  const engine = useLessonEngineStore((s) => s.engine);
  const current = useLessonEngineStore((s) => s.current);
  const engineData = useLessonEngineStore((s) => s.data);
  const init = useLessonEngineStore((s) => s.init);
  const jumpTo = useLessonEngineStore((s) => s.jumpTo);
  const reset = useLessonEngineStore((s) => s.reset);

  useEffect(() => {
    if (data?.data && !engine) {
      init(mapLesson(data.data));
    }
  }, [data, engine, init]);

  // تقدم محفوظ (حفظ محلي): نستأنف تلقائيًا عند إعادة التحميل.
  const { lastStepId, hasProgress, isCompleted } = useLessonProgress(data?.data?.lesson.id ?? 0);

  useEffect(() => {
    // ننتقل لآخر شاشة محفوظة، دون إعادة إكمال درس انتهى سابقًا.
    if (engine && current?.screen === "start" && hasProgress && !isCompleted && lastStepId) {
      jumpTo(lastStepId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, current?.screen]);

  // يسجّل تقدم الطالب تلقائيًا محليًا (الشاشة الحالية + الإكمال)،
  // ويزامن البداية/الإكمال مع الباك (فوق الحفظ المحلي دون تغييره).
  useLessonProgressSync(lessonSlug);

  useEffect(() => () => reset(), [reset]);

  if (isLoading || (!engine && !isError)) {
    return <LessonPlayerSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader className="items-center text-center">
            <CardTitle>تعذر تحميل الدرس</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </CardContent>
          <CardContent className="flex justify-center">
            <Button onClick={() => refetch()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!engine || !current) {
    return null;
  }

  const Stage = stageRenderer[current.screen];

  // العودة إلى صفحة «دروس المادة» التي جاء منها الطالب (Pagina الوحدة) —
  // عبر سلَغ المادة والوحدة إن توفّرا، وإلا فالرجوع الخلفي/onFinish.
  const goToCourseLessons = () => {
    const subjectSlug = engineData?.subjectSlug;
    const courseSlug = engineData?.courseSlug;
    if (subjectSlug && courseSlug) {
      router.push(`/home/subject/${subjectSlug}/course/${courseSlug}`);
      return;
    }
    if (onFinish) {
      onFinish();
      return;
    }
    router.back();
  };

  // شاشات البداية/التقييم تدير أزرارها داخل المحتوى (ابدأ/تحقق/التالي)؛
  // نُمرّر footer صريحًا لكل شاشة عوضًا عن الافتراضي «متابعة».
  const footer =
    current.screen === "start" || current.screen === "assessment" ? (
      <div aria-hidden className="h-3" />
    ) : current.screen === "finish" ? (
      <Button size="lg" className="h-12 w-full text-base" onClick={goToCourseLessons}>
        العودة إلى دَروس المادة
      </Button>
    ) : undefined;

  return (
    <LessonShell phaseLabel={PHASE_LABEL[current.screen]} footer={footer}>
      <Stage />
    </LessonShell>
  );
}

function LessonPlayerSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex h-14 items-center gap-3 border-b">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-2 w-full animate-pulse bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

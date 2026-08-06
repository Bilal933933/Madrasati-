"use client";

import { useEffect, useMemo } from "react";
import { useTrial } from "../hooks/useTrial";
import { TrialFinish } from "./trial-finish";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import { mapLesson } from "@/features/lesson-engine/engine/lesson-mapper";
import { stageRenderer } from "@/features/lesson-engine/engine/stage-renderer";
import { PHASE_LABEL } from "@/features/lesson-engine/engine/journey";
import { LessonShell } from "@/features/lesson-engine/components/lesson-shell";
import { getErrorMessage } from "@/lib/apiErrors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * مشغّل النسخة التجريبية — تركيب فوق محرك الدرس (LessonPlayer) لكن:
 *  - يجلب /api/trial (دراسة مصغّرة: فقرة + فيديو قصير + سؤالين).
 *  - بلا مزامنة تقدم (الزائر بلا حساب، والتجربة لا تُتتبع).
 *  - شاشة النهاية تتحول إلى لحظة تحويل (TrialFinish) نحو التسجيل.
 */
export function TrialPlayer() {
  const { data, isLoading, isError, error, refetch } = useTrial();
  const engine = useLessonEngineStore((s) => s.engine);
  const current = useLessonEngineStore((s) => s.current);
  const init = useLessonEngineStore((s) => s.init);
  const reset = useLessonEngineStore((s) => s.reset);
  const jumpTo = useLessonEngineStore((s) => s.jumpTo);

  const mapped = useMemo(() => (data?.data ? mapLesson(data.data) : null), [data]);

  useEffect(() => {
    if (mapped && !engine) {
      init(mapped);
    }
  }, [mapped, engine, init]);

  useEffect(() => () => reset(), [reset]);

  if (isLoading || (!engine && !isError)) {
    return <TrialSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader className="items-center text-center">
            <CardTitle>تعذر تحميل التجربة</CardTitle>
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

  if (current.screen === "finish") {
    return (
      <LessonShell phaseLabel={PHASE_LABEL.finish} footer={<div aria-hidden className="h-3" />}>
        <TrialFinish onRetry={() => jumpTo("start")} />
      </LessonShell>
    );
  }

  const Stage = stageRenderer[current.screen];

  const footer =
    current.screen === "start" || current.screen === "assessment" ? (
      <div aria-hidden className="h-3" />
    ) : undefined;

  return (
    <LessonShell phaseLabel={PHASE_LABEL[current.screen]} footer={footer}>
      <Stage />
    </LessonShell>
  );
}

function TrialSkeleton() {
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
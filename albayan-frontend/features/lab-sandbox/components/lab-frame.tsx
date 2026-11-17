"use client";

import type { LabDefinition } from "../engine/types";
import type { LabVariant } from "../variants";
import { LabSimPanel } from "./lab-sim-panel";
import { TheoryPanel } from "./theory-panel";

interface LabFrameProps {
  lab: LabDefinition;
  variant: LabVariant;
}

/**
 * ثلاثة هياكل لنفس المختبر ونفس البيانات — للمقارنة قبل الدمج:
 * book    : صفحتا كتاب (شرح يمين، مشهد يسار) — أول عنصر في RTL يظهر يميناً.
 * focus   : مسرح عريض أعلى الصفحة والشرح أسفله.
 * compact : بعرض LessonShell الحقيقي (max-w-2xl) مكدّساً.
 */
export function LabFrame({ lab, variant }: LabFrameProps) {
  if (variant === "focus") {
    return (
      <div className="flex flex-col gap-4">
        <LabSimPanel lab={lab} />
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <TheoryPanel lab={lab} />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <TheoryPanel lab={lab} />
        </div>
        <LabSimPanel lab={lab} size="compact" />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:p-6">
        <TheoryPanel lab={lab} />
      </div>
      <LabSimPanel lab={lab} />
    </div>
  );
}

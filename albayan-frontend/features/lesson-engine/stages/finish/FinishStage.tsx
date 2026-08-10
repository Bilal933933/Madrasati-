"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ClipboardList, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import type { LessonUnitFeed } from "@/features/lesson-engine/engine/types";

/**
 * شاشة النهاية — إغلاق الرحلة باحتفال بسيط، ثم توجيه مريح:
 * - إن اكتملت الوحدة (المقرر) فعليًا (كل دروسها منجزة): احتفال نهاية الوحدة
 *   مع ملخص الدروس وزر [ابدأ الوحدة التالية] (5.6).
 * - وإلا: الدرس التالي غير المكتمل (حسب تقدم الطالب، لا الترتيب)، أو توجيه
 *   محايد لاستكمال باقي الدروس. لا تُعلن «اكتمال الوحدة» إلا عند اكتمالها فعلًا.
 * لا تكشف عن نتيجة (رحلة تعلّم لا امتحان).
 */
export function FinishStage() {
  const router = useRouter();
  const data = useLessonEngineStore((s) => s.data);
  const title = data?.title ?? "هذا الدرس";
  const course = data?.course;
  const nextLesson = data?.nextLesson ?? null;
  const lessonExam = data?.lessonExam ?? null;
  const unit = data?.unit ?? null;

  const unitCompleted = unit?.completion.status === "completed";
  const subjectSlug = data?.subjectSlug;
  const courseSlug = data?.courseSlug;

  const goToCourseLessons = () => {
    if (subjectSlug && courseSlug) {
      router.push(`/home/subject/${subjectSlug}/course/${courseSlug}`);
      return;
    }
    router.back();
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-5 py-8 text-center">
      {/* توهّج خلفي ناعم خلف دائرة النجاح */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-4 size-40 rounded-full bg-emerald-500/10 blur-3xl"
      />

      {unitCompleted && unit ? (
        <UnitFinished
          unit={unit}
          onStartNext={() => unit.next_course?.start_slug && router.push(`/learn/${unit.next_course.start_slug}`)}
          onBack={goToCourseLessons}
        />
      ) : (
        <>
          <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Check className="size-10 text-white" strokeWidth={3} aria-hidden />
          </span>

          <h2 className="text-2xl font-bold leading-tight text-foreground">أكملت {title}</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            استمر في التعلّم خطوة بخطوة، وستجمع كل يوم فكرة جديدة حتى تتقن المفاهيم.
          </p>

          {/* الدرس التالي: أول درس غير مكتمل حسب تقدم الطالب (إن لم تنته الوحدة). */}
          {unit?.completion.next_lesson ? (
            <div className="flex w-full max-w-sm flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 text-start shadow-sm ring-1 ring-border/40">
              <p className="text-xs font-semibold text-muted-foreground">
                الدرس التالي{course ? ` في ${course}` : ""}
              </p>
              <h3 className="text-base font-bold leading-snug text-foreground">
                {unit.completion.next_lesson.title}
              </h3>
              <Button
                size="lg"
                className="h-11 w-full text-base"
                onClick={() => unit.completion.next_lesson?.slug && router.push(`/learn/${unit.completion.next_lesson.slug}`)}
              >
                ابدأ الدرس التالي
                <ArrowLeft className="size-5" aria-hidden />
              </Button>
            </div>
          ) : nextLesson ? (
            <div className="flex w-full max-w-sm flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 text-start shadow-sm ring-1 ring-border/40">
              <p className="text-xs font-semibold text-muted-foreground">
                الدرس التالي{course ? ` في ${course}` : ""}
              </p>
              <h3 className="text-base font-bold leading-snug text-foreground">{nextLesson.title}</h3>
              {nextLesson.summary ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {nextLesson.summary}
                </p>
              ) : null}
              <Button
                size="lg"
                className="h-11 w-full text-base"
                onClick={() => nextLesson.slug && router.push(`/learn/${nextLesson.slug}`)}
              >
                ابدأ الدرس التالي
                <ArrowLeft className="size-5" aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-border/40">
              <p className="text-sm font-medium text-muted-foreground">
                أنهيت هذا الدرس — يتبقى لك بعض دروس هذه الوحدة لتنجزها.
              </p>
              <Button size="lg" className="h-11 w-full text-base" onClick={goToCourseLessons}>
                العودة إلى دَرَوس المادة
              </Button>
            </div>
          )}

          {lessonExam ? (
            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full max-w-sm text-base"
              onClick={() => router.push(`/exams/${lessonExam.id}`)}
            >
              عرض اختبار الدرس
              <ClipboardList className="size-5" aria-hidden />
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * احتفال نهاية الوحدة (5.6) — يُعرض فقط عند اكتمال كل دروس الوحدة فعلًا:
 * ملخص كمي (الدروس المكتملة/الإجمالي) + مسار واضح للأمام (الوحدة التالية أو العودة).
 */
function UnitFinished({
  unit,
  onStartNext,
  onBack,
}: {
  unit: LessonUnitFeed;
  onStartNext: () => void;
  onBack: () => void;
}) {
  const { completed_count, total_count, progress } = unit.completion;
  const nextCourse = unit.next_course;

  return (
    <>
      <span className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg shadow-amber-500/30">
        <PartyPopper className="size-12 text-white" strokeWidth={2.5} aria-hidden />
      </span>

      <h2 className="text-3xl font-black leading-tight text-foreground">أنهيت وحدة {unit.course.name}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        أحسنت — أكملت جميع دروس هذه الوحدة. إليك خلاصة رحلتك فيها.
      </p>

      <div className="flex w-full max-w-sm items-center justify-between rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm ring-1 ring-border/40">
        <span className="text-sm font-semibold text-muted-foreground">الدروس المكتملة</span>
        <span className="text-lg font-black text-foreground">
          {completed_count}/{total_count}
        </span>
      </div>

      <div className="flex w-full max-w-sm items-center justify-between gap-3">
        <span className="flex-1">
          <div aria-hidden className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </span>
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progress}%</span>
      </div>

      {nextCourse ? (
        <Button size="lg" className="h-11 w-full max-w-sm text-base" onClick={onStartNext}>
          ابدأ الوحدة التالية
          <ArrowLeft className="size-5" aria-hidden />
        </Button>
      ) : (
        <Button size="lg" className="h-11 w-full max-w-sm text-base" onClick={onBack}>
          العودة إلى دَرَوس المادة
        </Button>
      )}
    </>
  );
}
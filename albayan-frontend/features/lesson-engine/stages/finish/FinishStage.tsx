"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";

/**
 * شاشة النهاية — إغلاق الرحلة باحتفال بسيط، ثم توجيه مريح:
 * الدرس التالي في المقرر (مع معلوماته إن وُجد)، وزر «عرض اختبار الدرس»
 * إن كان للدرس اختبار مرتبط. لا تكشف عن نتيجة (رحلة تعلّم لا امتحان).
 */
export function FinishStage() {
  const router = useRouter();
  const data = useLessonEngineStore((s) => s.data);
  const title = data?.title ?? "هذا الدرس";
  const course = data?.course;
  const nextLesson = data?.nextLesson ?? null;
  const lessonExam = data?.lessonExam ?? null;

  return (
    <div className="relative flex w-full flex-col items-center gap-5 py-8 text-center">
      {/* توهّج خلفي ناعم خلف دائرة النجاح */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-4 size-40 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
        <Check className="size-10 text-white" strokeWidth={3} aria-hidden />
      </span>

      <h2 className="text-2xl font-bold leading-tight text-foreground">أكملت {title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        استمر في التعلّم خطوة بخطوة، وستجمع كل يوم فكرة جديدة حتى تتقن المفاهيم.
      </p>

      {nextLesson ? (
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
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          أنهيت جميع دروس هذه الوحدة — أحسنت
        </p>
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
    </div>
  );
}
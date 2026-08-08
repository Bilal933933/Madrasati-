import { useEffect, useRef } from "react";
import { useLessonEngineStore } from "../engine/lesson-engine-store";
import { useLessonProgressStore } from "../state/lessonProgressStore";
import { useLessonProgress } from "./useLessonProgress";
import { lessonApi } from "../services/lessonApi";

/**
 * هوك مزامنة تقدم الطالب داخل الدرس.
 * شغّله مرة واحدة داخل صفحة الدرس (بعد تحميل الرحلة): يراقب الشاشة الحالية
 * لمحرك الدرس ويسجّل كل شاشة يصل إليها الطالب حتى في حال الرجوع، ويعلّم
 * الدرس مكتملًا عند بلوغ شاشة النهاية.
 *
 * المزامنة مع الباك (فوق الحفظ المحلي دون تغييره):
 * - start: أول ما ينتقل الطالب من شاشة البداية (بدءًا أو استئنافًا).
 * - complete: عند بلوغ شاشة النهاية.
 * كلاهما fire-and-forget — فشل الشبكة لا يعطّل اللعب.
 */
export function useLessonProgressSync(lessonSlug: string) {
  const data = useLessonEngineStore((state) => state.data);
  const current = useLessonEngineStore((state) => state.current);
  const flow = useLessonEngineStore((state) => state.flow);
  const recordStep = useLessonProgressStore((state) => state.recordStep);
  const markCompleted = useLessonProgressStore((state) => state.markCompleted);

  const lessonId = data?.lessonId;
  const { isCompleted } = useLessonProgress(lessonId ?? 0);

  const stepId = current?.id;
  const screen = current?.screen;

  // نتتبع ما سبق أن سجّلناه من شاشات لتفادي التكرار المتكرر في إعادة الرسم.
  const recordedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (lessonId === undefined || !stepId) {
      return;
    }
    const key = `${lessonId}:${stepId}`;
    if (recordedRef.current.has(key)) {
      return;
    }
    recordedRef.current.add(key);
    recordStep(lessonId, stepId, flow.length);
  }, [lessonId, stepId, flow.length, recordStep]);

  useEffect(() => {
    if (lessonId === undefined) {
      return;
    }
    if (screen === "finish" && !isCompleted) {
      markCompleted(lessonId);
    }
  }, [lessonId, screen, isCompleted, markCompleted]);

  // مزامنة الباك: start مرة واحدة عند بدء الدرس فعليًا (الخروج من شاشة البداية).
  const startSentRef = useRef(false);

  useEffect(() => {
    if (!lessonSlug || !screen || screen === "start" || startSentRef.current) {
      return;
    }
    startSentRef.current = true;
    lessonApi.start(lessonSlug).catch(() => {});
  }, [lessonSlug, screen]);

  // مزامنة الباك: complete عند بلوغ شاشة النهاية.
  const completeSentRef = useRef(false);

  useEffect(() => {
    if (!lessonSlug || screen !== "finish" || completeSentRef.current) {
      return;
    }
    completeSentRef.current = true;
    lessonApi.complete(lessonSlug).catch(() => {});
  }, [lessonSlug, screen]);
}
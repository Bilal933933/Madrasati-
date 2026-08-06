import { useEffect, useRef } from "react";
import { useLessonEngineStore } from "../engine/lesson-engine-store";
import { useLessonProgressStore } from "../state/lessonProgressStore";
import { useLessonProgress } from "./useLessonProgress";

/**
 * هوك المزامنة التلقائية لتقدم الطالب داخل الدرس.
 * شغّله مرة واحدة داخل صفحة الدرس (بعد تحميل الرحلة): يراقب الشاشة الحالية
 * لمحرك الدرس ويسجّل كل شاشة يصل إليها الطالب حتى في حال الرجوع، ويعلّم
 * الدرس مكتملًا عند بلوغ شاشة النهاية.
 */
export function useLessonProgressSync() {
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
}
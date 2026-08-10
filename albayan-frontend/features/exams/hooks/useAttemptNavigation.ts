import { useCallback, useEffect, useState } from "react";
import { useExamProgressStore } from "../state/examProgressStore";

/**
 * تنقل المحاولة — الموضع الحالي بين الأسئلة مع حفظه محليًا لضمان الاستئناف.
 */
export function useAttemptNavigation(
  attemptId: number,
  questionCount: number,
  serverCurrentIndex: number
) {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const entry = useExamProgressStore.getState().getEntry(attemptId);
    // التقدم الرسمي من الباك، مع تفضيل النسخة المحلية الأحدث (أوفلاين أو شبه إرسال).
    return entry?.index ?? serverCurrentIndex ?? 0;
  });

  // حفظ الموضع الحالي محليًا عند كل نقلة — النسخة المحلية من وعي المستخدم
  useEffect(() => {
    useExamProgressStore.getState().setIndex(attemptId, currentIndex);
  }, [attemptId, currentIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(questionCount - 1, i + 1));
  }, [questionCount]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const jumpTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < questionCount) {
        setCurrentIndex(index);
      }
    },
    [questionCount]
  );

  return {
    currentIndex,
    goToNext,
    goToPrevious,
    jumpTo,
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: currentIndex === questionCount - 1,
  };
}
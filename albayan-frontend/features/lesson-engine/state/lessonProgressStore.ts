import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LessonProgressEntry,
  PersistedLessonProgress,
} from "../types/progress.types";

const STORAGE_KEY = "madrasati.lesson-progress.v1";

interface LessonProgressState {
  entries: Record<string, LessonProgressEntry>;
  /** يسجّل أن الطالب وصل لشاشة (زيارة/استئناف) داخل درس. */
  recordStep: (lessonId: number, stepId: string, totalSteps: number) => void;
  /** يعلّم الدرس مكتملًا. */
  markCompleted: (lessonId: number) => void;
  /** يمسح تقدم درس (إعادة البدء). */
  clearLesson: (lessonId: number) => void;
  /** يقرأ سجل درس واحد. */
  getEntry: (lessonId: number) => LessonProgressEntry | null;
}

/**
 * مخزن تقدم الطالب داخل الدرس — محلي بالكامل (Zustand + localStorage).
 * يُصان تلقائيًا عبر `persist` تحت المفتاح `madrasati.lesson-progress.v1`.
 */
export const useLessonProgressStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      entries: {},

      recordStep: (lessonId, stepId, totalSteps) => {
        const key = String(lessonId);
        const existing = get().entries[key];
        const visited = existing?.visitedStepIds ?? [];

        if (existing?.lastStepId === stepId && visited.includes(stepId)) {
          return;
        }

        const nextVisited = visited.includes(stepId)
          ? visited
          : [...visited, stepId];

        set({
          entries: {
            ...get().entries,
            [key]: {
              lessonId,
              totalSteps,
              lastStepId: stepId,
              visitedStepIds: nextVisited,
              completedAt: existing?.completedAt ?? null,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      markCompleted: (lessonId) => {
        const key = String(lessonId);
        const existing = get().entries[key];
        if (!existing || existing.completedAt) {
          return;
        }
        set({
          entries: {
            ...get().entries,
            [key]: {
              ...existing,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      clearLesson: (lessonId) => {
        const next = { ...get().entries };
        delete next[String(lessonId)];
        set({ entries: next });
      },

      getEntry: (lessonId) => get().entries[String(lessonId)] ?? null,
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // نتجنّب حفظ الأخطاء/المنطق في التخزين — نُحفظ القيم فقط.
      partialize: (state): PersistedLessonProgress => ({
        version: 1,
        entries: state.entries,
      }),
    }
  )
);

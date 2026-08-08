import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExamAnswerValue,
  ExamProgressEntry,
  PersistedExamProgress,
} from "../types/progress.types";

const STORAGE_KEY = "madrasati.exam-progress.v1";

/**
 * قراءة المفاتيح القديمة للمحرك (قبل وجود هذا المخزن) ونقلها ثم حذفها —
 * تحت المفتاح القديم exam-attempt-{id}-index / exam-attempt-{id}-flag.
 */
function readLegacy(
  attemptId: number
): { index?: number; flagged?: Record<number, boolean> } {
  if (typeof window === "undefined") return {};

  const out: { index?: number; flagged?: Record<number, boolean> } = {};

  try {
    const raw = window.localStorage.getItem(`exam-attempt-${attemptId}-index`);
    if (raw) out.index = JSON.parse(raw) as number;
  } catch {
    /* تجاهل */
  }
  try {
    const raw = window.localStorage.getItem(`exam-attempt-${attemptId}-flag`);
    if (raw) out.flagged = JSON.parse(raw) as Record<number, boolean>;
  } catch {
    /* تجاهل */
  }

  try {
    window.localStorage.removeItem(`exam-attempt-${attemptId}-index`);
    window.localStorage.removeItem(`exam-attempt-${attemptId}-flag`);
  } catch {
    /* تجاهل */
  }

  return out;
}

function emptyEntry(attemptId: number): ExamProgressEntry {
  const legacy = readLegacy(attemptId);

  return {
    attemptId,
    index: legacy.index ?? 0,
    flagged: legacy.flagged ?? {},
    answers: {},
    pendingAnswers: [],
    updatedAt: null,
  };
}

interface ExamProgressState {
  entries: Record<string, ExamProgressEntry>;
  getEntry: (attemptId: number) => ExamProgressEntry | null;
  /** دمج نسخة كاملة من الإجابات + قائمة الأسئلة بانتظار إرسال الباك. */
  seed: (
    attemptId: number,
    answers: Record<number, ExamAnswerValue>,
    pending: number[]
  ) => void;
  setIndex: (attemptId: number, index: number) => void;
  setFlag: (attemptId: number, questionId: number, value: boolean) => void;
  /** تحديث إجابة محلية — تُعلَّم كباندار إرسال للباك. */
  setAnswer: (
    attemptId: number,
    questionId: number,
    value: ExamAnswerValue
  ) => void;
  /** تثبيت حالة الإرسال إلى الباك (نجح/فشل) لسؤال معين. */
  markSynced: (attemptId: number, questionId: number, synced: boolean) => void;
  clearAttempt: (attemptId: number) => void;
}

/**
 * مخزن التقدم المحلي للمحاولات — يُحفظ تحت madrasati.exam-progress.v1.
 * يستخدمه محرك المحاولة كنسخة احتياطية وتجاوب إعادة التحميل.
 */
export const useExamProgressStore = create<ExamProgressState>()(
  persist(
    (set, get) => ({
      entries: {},

      getEntry: (attemptId) => get().entries[String(attemptId)] ?? null,

      seed: (attemptId, answers, pending) => {
        const key = String(attemptId);
        const prev = get().entries[key] ?? emptyEntry(attemptId);

        set({
          entries: {
            ...get().entries,
            [key]: {
              ...prev,
              answers,
              pendingAnswers: Array.from(
                new Set([...prev.pendingAnswers, ...pending])
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      setIndex: (attemptId, index) => {
        const key = String(attemptId);
        const prev = get().entries[key] ?? emptyEntry(attemptId);

        set({
          entries: {
            ...get().entries,
            [key]: { ...prev, index, updatedAt: new Date().toISOString() },
          },
        });
      },

      setFlag: (attemptId, questionId, value) => {
        const key = String(attemptId);
        const prev = get().entries[key] ?? emptyEntry(attemptId);

        set({
          entries: {
            ...get().entries,
            [key]: {
              ...prev,
              flagged: { ...prev.flagged, [questionId]: value },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      setAnswer: (attemptId, questionId, value) => {
        const key = String(attemptId);
        const prev = get().entries[key] ?? emptyEntry(attemptId);

        set({
          entries: {
            ...get().entries,
            [key]: {
              ...prev,
              answers: { ...prev.answers, [questionId]: value },
              pendingAnswers: Array.from(
                new Set([...prev.pendingAnswers, questionId])
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      markSynced: (attemptId, questionId, synced) => {
        const key = String(attemptId);
        const prev = get().entries[key];
        if (!prev) return;

        const pendingAnswers = synced
          ? prev.pendingAnswers.filter((q) => q !== questionId)
          : Array.from(new Set([...prev.pendingAnswers, questionId]));

        set({
          entries: {
            ...get().entries,
            [key]: {
              ...prev,
              pendingAnswers,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      clearAttempt: (attemptId) => {
        const next = { ...get().entries };
        delete next[String(attemptId)];
        set({ entries: next });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // نُحفظ القيم فقط دون الدوال.
      partialize: (state): PersistedExamProgress => ({
        version: 1,
        entries: state.entries,
      }),
    }
  )
);
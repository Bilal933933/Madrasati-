import { create } from "zustand";
import { LessonEngine } from "./lesson-engine";
import type { LessonEngineData, LessonFlowStep, LessonUnitFeed } from "./types";

interface LessonEngineState {
  engine: LessonEngine | null;
  data: LessonEngineData | null;
  current: LessonFlowStep | null;
  currentIndex: number;
  total: number;
  flow: LessonFlowStep[];
  init: (data: LessonEngineData) => void;
  next: () => void;
  back: () => void;
  /** قفز مباشرة إلى شاشة بمعرّفها (استئناف التقدم المحفوظ). */
  jumpTo: (stepId: string) => void;
  /** تحديث ملخص الوحدة (بعد إكمال الدرس) دون إعادة بناء المحرك كاملًا. */
  syncUnit: (unit: LessonUnitFeed | null) => void;
  reset: () => void;
}

/**
 * حالة محرك الدرس — جسر بين الـ Player (فئة نقية) ومكونات الواجهة.
 * بسيطة: مؤشر + عنصر حالي + التنقل فقط.
 */
export const useLessonEngineStore = create<LessonEngineState>((set, get) => ({
  engine: null,
  data: null,
  current: null,
  currentIndex: 0,
  total: 0,
  flow: [],

  init: (data) => {
    const engine = new LessonEngine(data);
    set({
      engine,
      data,
      current: engine.current,
      currentIndex: engine.currentIndex,
      total: engine.total,
      flow: engine.flow,
    });
  },

  next: () => {
    const engine = get().engine;
    if (!engine || !engine.next()) {
      return;
    }
    set({
      current: engine.current,
      currentIndex: engine.currentIndex,
    });
  },

  back: () => {
    const engine = get().engine;
    if (!engine || !engine.back()) {
      return;
    }
    set({
      current: engine.current,
      currentIndex: engine.currentIndex,
    });
  },

  jumpTo: (stepId) => {
    const engine = get().engine;
    if (!engine || !engine.jumpTo(stepId)) {
      return;
    }
    set({
      current: engine.current,
      currentIndex: engine.currentIndex,
    });
  },

  syncUnit: (unit) => {
    const data = get().data;
    if (!data) {
      return;
    }
    set({ data: { ...data, unit } });
  },

  reset: () => {
    set({
      engine: null,
      data: null,
      current: null,
      currentIndex: 0,
      total: 0,
      flow: [],
    });
  },
}));

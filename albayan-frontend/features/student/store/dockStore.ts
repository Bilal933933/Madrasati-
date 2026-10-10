import { create } from "zustand";
import { persist } from "zustand/middleware";

type DockState = {
  /** طي شريط التنقل (وضع التركيز) — يُحفظ في متصفح الطالب. */
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
};

/**
 * حالة طي شريط الطالب — Zustand مع حفظ دائم في localStorage
 * بنفس نمط lessonProgressStore (مفتاح madrasati.*).
 * القيمة الافتراضية false لذا لا يوجد عدم تطابق مع عرض السيرفر الأول.
 */
export const useDockStore = create<DockState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    { name: "madrasati.student-dock.v1" },
  ),
);

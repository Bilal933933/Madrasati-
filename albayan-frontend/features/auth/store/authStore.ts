import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isInitialized: boolean; // هل تم التحقق من حالة الدخول عند تحميل التطبيق؟
  setUser: (user: AuthUser | null) => void;
  setInitialized: (value: boolean) => void;
  clear: () => void;
}

/**
 * ملاحظة مهمة: هذا المخزن لا يخزّن أي Token
 * لأننا نعتمد على HttpOnly Cookie لا يمكن قراءتها من JS أصلًا.
 * دوره الوحيد هو الاحتفاظ ببيانات المستخدم المعروضة في الواجهة.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (value) => set({ isInitialized: value }),
  clear: () => set({ user: null }),
}));

import { apiClient } from "@/lib/apiClient";
import type {
  CompletedLessonsResponse,
  StudentCourseResponse,
  StudentHomeResponse,
  StudentSubjectResponse,
} from "../types/student.types";

export interface SsrContext {
  /** كوكيز طلب المتصفح الوارد — تُرسل للباك أثناء SSR. */
  cookie: string;
  /** أصل المتصفح (Origin) — Sanctum يرفض الجلسة بلا Origin من دومين stateful. */
  origin: string;
}

/**
 * واجهة بيت الطالب — مسار محمي للمستخدم المسجّل فقط.
 * أثناء SSR تُمرَّر كوكيز المتصفح وأصله كي يرى الباك الجلسةَ.
 */
export const studentHomeApi = {
  home: (ssr?: SsrContext) =>
    apiClient<StudentHomeResponse>("/api/student/home", {
      method: "GET",
      cache: "no-store",
      ...(ssr
        ? { ssrCookies: ssr.cookie, ssrOrigin: ssr.origin }
        : {}),
    }),

  /** صفحة المادة للطالب — المادة بمقرراتها وتقدم كل مقرر للمستخدم الحالي. */
  subject: (slug: string, ssr?: SsrContext) =>
    apiClient<StudentSubjectResponse>(`/api/student/subjects/${slug}`, {
      method: "GET",
      cache: "no-store",
      ...(ssr
        ? { ssrCookies: ssr.cookie, ssrOrigin: ssr.origin }
        : {}),
    }),

  /** صفحة المقرر للطالب — المقرر بدروسه وتقدم كل درس للمستخدم الحالي. */
  course: (slug: string, ssr?: SsrContext) =>
    apiClient<StudentCourseResponse>(`/api/student/courses/${slug}`, {
      method: "GET",
      cache: "no-store",
      ...(ssr
        ? { ssrCookies: ssr.cookie, ssrOrigin: ssr.origin }
        : {}),
    }),

  /** ربط الطالب بمحتواه: اختيار الصف والفصل الدراسي. */
  saveProfile: (payload: { grade_id: number; semester_id: number }) =>
    apiClient<{ message: string }>("/api/student/profile", {
      method: "POST",
      withCsrf: true,
      body: JSON.stringify(payload),
    }),

  /** سجل نتائج الدروس المكتملة للطالب + إحصائياتها. */
  completedLessons: (ssr?: SsrContext) =>
    apiClient<CompletedLessonsResponse>("/api/student/completed-lessons", {
      method: "GET",
      cache: "no-store",
      ...(ssr
        ? { ssrCookies: ssr.cookie, ssrOrigin: ssr.origin }
        : {}),
    }),
};

import { apiClient } from "@/lib/apiClient";
import type { ApiMessageResponse } from "@/features/auth/types/auth.types";
import type { AchievementUnlocksPayload } from "@/features/achievements/types/achievement.types";
import type { LessonFlowResponse } from "@/features/lesson-builder/types/lesson-builder.types";

/** استجابة إكمال الدرس — تحمل الأوسمة المفتوحة حديثًا (إن وُجدت). */
export interface LessonCompleteResponse
  extends ApiMessageResponse,
    AchievementUnlocksPayload {}

export const lessonApi = {
  getBySlug: (slug: string) =>
    apiClient<LessonFlowResponse>(`/api/lessons/${slug}`, {
      method: "GET",
    }),

  /** يسجّل بدء الدرس للطالب المسجّل (تقدم الباك). */
  start: (slug: string) =>
    apiClient<ApiMessageResponse>(`/api/student/lessons/${slug}/start`, {
      method: "POST",
      withCsrf: true,
    }),

  /** يسجّل إكمال الدرس للطالب المسجّل (تقدم الباك) ويعيد الأوسمة المفتوحة. */
  complete: (slug: string) =>
    apiClient<LessonCompleteResponse>(`/api/student/lessons/${slug}/complete`, {
      method: "POST",
      withCsrf: true,
    }),
};

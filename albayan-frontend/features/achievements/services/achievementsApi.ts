import { apiClient } from "@/lib/apiClient";
import type {
  AchievementDeleteResponse,
  AchievementListResponse,
  AchievementMutationResponse,
  AchievementPayload,
  AdminAchievementListResponse,
} from "../types/achievement.types";

/** استدعاءات نظام الإنجازات — قائمة الطالب + إدارة الأوسمة. */
export const achievementsApi = {
  /** إنجازات الطالب مع التقدم وحالة الفتح. */
  listStudent: () =>
    apiClient<AchievementListResponse>("/api/achievements", {
      method: "GET",
    }),

  /** تعريفات الإنجازات (الإدارة — بلا ترقيم، تعود كلها). */
  listAdmin: () =>
    apiClient<AdminAchievementListResponse>("/api/admin/achievements", {
      method: "GET",
    }),

  create: (payload: AchievementPayload) =>
    apiClient<AchievementMutationResponse>("/api/admin/achievements", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  update: (id: number, payload: AchievementPayload) =>
    apiClient<AchievementMutationResponse>(`/api/admin/achievements/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  delete: (id: number) =>
    apiClient<AchievementDeleteResponse>(`/api/admin/achievements/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};
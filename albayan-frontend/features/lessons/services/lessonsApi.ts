import { apiClient } from "@/lib/apiClient";
import type {
  LessonDeleteResponse,
  LessonListResponse,
  LessonMutationResponse,
  LessonPayload,
} from "../types/lesson.types";

export const lessonsApi = {
  listLessons: () =>
    apiClient<LessonListResponse>("/api/admin/lessons", {
      method: "GET",
    }),

  createLesson: (payload: LessonPayload) =>
    apiClient<LessonMutationResponse>("/api/admin/lessons", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateLesson: (id: number, payload: LessonPayload) =>
    apiClient<LessonMutationResponse>(`/api/admin/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteLesson: (id: number) =>
    apiClient<LessonDeleteResponse>(`/api/admin/lessons/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

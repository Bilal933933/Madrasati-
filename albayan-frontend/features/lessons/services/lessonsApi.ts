import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  LessonDeleteResponse,
  LessonListResponse,
  LessonMutationResponse,
  LessonPayload,
} from "../types/lesson.types";

export interface LessonListFilters {
  courseId?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const lessonsApi = {
  listLessons: (filters?: LessonListFilters) =>
    apiClient<LessonListResponse>(
      "/api/admin/lessons" + buildListQuery({ course_id: filters?.courseId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (courseId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/lessons/next-order" + buildListQuery({ course_id: courseId }),
      {
        method: "GET",
      }
    ),

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

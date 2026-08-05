import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  LessonDeleteResponse,
  LessonListResponse,
  LessonMutationResponse,
  LessonResponse,
  LessonPayload,
} from "../types/lesson.types";

export interface LessonListFilters {
  stageId?: number;
  gradeId?: number;
  semesterId?: number;
  subjectId?: number;
  courseId?: number;
  page?: number;
  perPage?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const lessonsApi = {
  listLessons: (filters?: LessonListFilters) =>
    apiClient<LessonListResponse>(
      "/api/admin/lessons" +
        buildListQuery({
          stage_id: filters?.stageId,
          grade_id: filters?.gradeId,
          semester_id: filters?.semesterId,
          subject_id: filters?.subjectId,
          course_id: filters?.courseId,
          page: filters?.page,
          per_page: filters?.perPage,
        }),
      {
        method: "GET",
      }
    ),

  getLesson: (id: number) =>
    apiClient<LessonResponse>(`/api/admin/lessons/${id}`, {
      method: "GET",
    }),

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

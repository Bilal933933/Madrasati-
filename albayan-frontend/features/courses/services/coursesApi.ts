import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type { operations } from "@/types/api.generated";
import type {
  CourseDeleteResponse,
  CourseListResponse,
  CourseMutationResponse,
  CoursePayload,
} from "../types/course.types";

export interface CourseListFilters {
  subjectId?: number;
}

/** استجابة next-order مأخوذة مباشرة من العملية المولّدة في types/api.generated.ts */
export type NextOrderResponse = operations["course.nextOrder"]["responses"][200]["content"]["application/json"];

export const coursesApi = {
  listCourses: (filters?: CourseListFilters) =>
    apiClient<CourseListResponse>(
      "/api/admin/courses" + buildListQuery({ subject_id: filters?.subjectId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (subjectId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/courses/next-order" + buildListQuery({ subject_id: subjectId }),
      {
        method: "GET",
      }
    ),

  createCourse: (payload: CoursePayload) =>
    apiClient<CourseMutationResponse>("/api/admin/courses", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateCourse: (id: number, payload: CoursePayload) =>
    apiClient<CourseMutationResponse>(`/api/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteCourse: (id: number) =>
    apiClient<CourseDeleteResponse>(`/api/admin/courses/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

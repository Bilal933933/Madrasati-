import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  CourseDeleteResponse,
  CourseListResponse,
  CourseMutationResponse,
  CoursePayload,
} from "../types/course.types";

export interface CourseListFilters {
  sectionId?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const coursesApi = {
  listCourses: (filters?: CourseListFilters) =>
    apiClient<CourseListResponse>(
      "/api/admin/courses" + buildListQuery({ section_id: filters?.sectionId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (sectionId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/courses/next-order" + buildListQuery({ section_id: sectionId }),
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

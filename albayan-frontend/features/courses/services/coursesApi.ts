import { apiClient } from "@/lib/apiClient";
import type {
  CourseDeleteResponse,
  CourseListResponse,
  CourseMutationResponse,
  CoursePayload,
} from "../types/course.types";

export const coursesApi = {
  listCourses: () =>
    apiClient<CourseListResponse>("/api/admin/courses", {
      method: "GET",
    }),

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

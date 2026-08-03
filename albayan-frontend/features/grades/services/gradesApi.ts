import { apiClient } from "@/lib/apiClient";
import type {
  GradeDeleteResponse,
  GradeListResponse,
  GradeMutationResponse,
  GradePayload,
} from "../types/grade.types";

export const gradesApi = {
  listGrades: () =>
    apiClient<GradeListResponse>("/api/admin/grades", {
      method: "GET",
    }),

  createGrade: (payload: GradePayload) =>
    apiClient<GradeMutationResponse>("/api/admin/grades", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateGrade: (id: number, payload: GradePayload) =>
    apiClient<GradeMutationResponse>(`/api/admin/grades/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteGrade: (id: number) =>
    apiClient<GradeDeleteResponse>(`/api/admin/grades/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

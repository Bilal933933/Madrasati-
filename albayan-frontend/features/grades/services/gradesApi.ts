import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  GradeDeleteResponse,
  GradeListResponse,
  GradeMutationResponse,
  GradePayload,
} from "../types/grade.types";

export interface GradeListFilters {
  stageId?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const gradesApi = {
  listGrades: (filters?: GradeListFilters) =>
    apiClient<GradeListResponse>(
      "/api/admin/grades" + buildListQuery({ stage_id: filters?.stageId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (stageId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/grades/next-order" + buildListQuery({ stage_id: stageId }),
      {
        method: "GET",
      }
    ),

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

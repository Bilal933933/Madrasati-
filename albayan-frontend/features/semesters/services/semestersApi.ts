import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  SemesterDeleteResponse,
  SemesterListResponse,
  SemesterMutationResponse,
  SemesterPayload,
} from "../types/semester.types";

export interface SemesterListFilters {
  gradeId?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const semestersApi = {
  listSemesters: (filters?: SemesterListFilters) =>
    apiClient<SemesterListResponse>(
      "/api/admin/semesters" + buildListQuery({ grade_id: filters?.gradeId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (gradeId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/semesters/next-order" + buildListQuery({ grade_id: gradeId }),
      {
        method: "GET",
      }
    ),

  createSemester: (payload: SemesterPayload) =>
    apiClient<SemesterMutationResponse>("/api/admin/semesters", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateSemester: (id: number, payload: SemesterPayload) =>
    apiClient<SemesterMutationResponse>(`/api/admin/semesters/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteSemester: (id: number) =>
    apiClient<SemesterDeleteResponse>(`/api/admin/semesters/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

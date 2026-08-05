import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  SubjectDeleteResponse,
  SubjectListResponse,
  SubjectMutationResponse,
  SubjectPayload,
} from "../types/subject.types";

export interface SubjectListFilters {
  gradeId?: number;
  semesterId?: number;
  page?: number;
  perPage?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const subjectsApi = {
  listSubjects: (filters?: SubjectListFilters) =>
    apiClient<SubjectListResponse>(
      "/api/admin/subjects" +
        buildListQuery({
          grade_id: filters?.gradeId,
          semester_id: filters?.semesterId,
          page: filters?.page,
          per_page: filters?.perPage,
        }),
      {
        method: "GET",
      }
    ),

  nextOrder: (gradeId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/subjects/next-order" + buildListQuery({ grade_id: gradeId }),
      {
        method: "GET",
      }
    ),

  createSubject: (payload: SubjectPayload) =>
    apiClient<SubjectMutationResponse>("/api/admin/subjects", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateSubject: (id: number, payload: SubjectPayload) =>
    apiClient<SubjectMutationResponse>(`/api/admin/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteSubject: (id: number) =>
    apiClient<SubjectDeleteResponse>(`/api/admin/subjects/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

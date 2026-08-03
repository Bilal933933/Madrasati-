import { apiClient } from "@/lib/apiClient";
import type {
  SubjectDeleteResponse,
  SubjectListResponse,
  SubjectMutationResponse,
  SubjectPayload,
} from "../types/subject.types";

export const subjectsApi = {
  listSubjects: () =>
    apiClient<SubjectListResponse>("/api/admin/subjects", {
      method: "GET",
    }),

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

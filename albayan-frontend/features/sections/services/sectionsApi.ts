import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  SectionDeleteResponse,
  SectionListResponse,
  SectionMutationResponse,
  SectionPayload,
} from "../types/section.types";

export interface SectionListFilters {
  subjectId?: number;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const sectionsApi = {
  listSections: (filters?: SectionListFilters) =>
    apiClient<SectionListResponse>(
      "/api/admin/sections" + buildListQuery({ subject_id: filters?.subjectId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (subjectId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/sections/next-order" + buildListQuery({ subject_id: subjectId }),
      {
        method: "GET",
      }
    ),

  createSection: (payload: SectionPayload) =>
    apiClient<SectionMutationResponse>("/api/admin/sections", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateSection: (id: number, payload: SectionPayload) =>
    apiClient<SectionMutationResponse>(`/api/admin/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteSection: (id: number) =>
    apiClient<SectionDeleteResponse>(`/api/admin/sections/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

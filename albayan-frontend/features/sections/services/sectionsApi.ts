import { apiClient } from "@/lib/apiClient";
import type {
  SectionDeleteResponse,
  SectionListResponse,
  SectionMutationResponse,
  SectionPayload,
} from "../types/section.types";

export const sectionsApi = {
  listSections: () =>
    apiClient<SectionListResponse>("/api/admin/sections", {
      method: "GET",
    }),

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

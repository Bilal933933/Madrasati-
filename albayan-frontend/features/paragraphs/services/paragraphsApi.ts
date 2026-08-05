import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  NextParagraphOrderResponse,
  ParagraphDeleteResponse,
  ParagraphListResponse,
  ParagraphMutationResponse,
  ParagraphPayload,
} from "../types/paragraph.types";

export interface ParagraphListFilters {
  lessonId?: number;
}

export const paragraphsApi = {
  listParagraphs: (filters?: ParagraphListFilters) =>
    apiClient<ParagraphListResponse>(
      "/api/admin/paragraphs" + buildListQuery({ lesson_id: filters?.lessonId }),
      {
        method: "GET",
      }
    ),

  nextOrder: (lessonId: number) =>
    apiClient<NextParagraphOrderResponse>(
      "/api/admin/paragraphs/next-order" + buildListQuery({ lesson_id: lessonId }),
      {
        method: "GET",
      }
    ),

  createParagraph: (payload: ParagraphPayload) =>
    apiClient<ParagraphMutationResponse>("/api/admin/paragraphs", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateParagraph: (id: number, payload: ParagraphPayload) =>
    apiClient<ParagraphMutationResponse>(`/api/admin/paragraphs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteParagraph: (id: number) =>
    apiClient<ParagraphDeleteResponse>(`/api/admin/paragraphs/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

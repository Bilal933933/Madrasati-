import { apiClient } from "@/lib/apiClient";
import type {
  AddBlockPayload,
  LessonFlowMutationResponse,
  LessonFlowResponse,
} from "../types/lesson-builder.types";

export const lessonBuilderApi = {
  getFlow: (lessonId: number) =>
    apiClient<LessonFlowResponse>(`/api/admin/lessons/${lessonId}/blocks`, {
      method: "GET",
    }),

  addBlock: (lessonId: number, payload: AddBlockPayload) =>
    apiClient<LessonFlowMutationResponse>(`/api/admin/lessons/${lessonId}/blocks`, {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  reorder: (lessonId: number, ids: number[]) =>
    apiClient<{ message: string }>(`/api/admin/lessons/${lessonId}/blocks/reorder`, {
      method: "POST",
      body: JSON.stringify({ ids }),
      withCsrf: true,
    }),

  toggle: (blockId: number, isPublished: boolean) =>
    apiClient<{ message: string; data: { id: number; is_published: boolean } }>(
      `/api/admin/lesson-blocks/${blockId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_published: isPublished }),
        withCsrf: true,
      }
    ),

  removeBlock: (blockId: number) =>
    apiClient<{ message: string }>(`/api/admin/lesson-blocks/${blockId}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};
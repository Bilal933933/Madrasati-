import { apiClient } from "@/lib/apiClient";
import type {
  StageDeleteResponse,
  StageListResponse,
  StageMutationResponse,
  StagePayload,
} from "../types/stage.types";

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

export const stagesApi = {
  listStages: () =>
    apiClient<StageListResponse>("/api/admin/stages", {
      method: "GET",
    }),

  nextOrder: () =>
    apiClient<NextOrderResponse>("/api/admin/stages/next-order", {
      method: "GET",
    }),

  createStage: (payload: StagePayload) =>
    apiClient<StageMutationResponse>("/api/admin/stages", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateStage: (id: number, payload: StagePayload) =>
    apiClient<StageMutationResponse>(`/api/admin/stages/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteStage: (id: number) =>
    apiClient<StageDeleteResponse>(`/api/admin/stages/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

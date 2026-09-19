import { apiClient } from "@/lib/apiClient";
import type {
  PlatformSettingsMutationResponse,
  PlatformSettingsResponse,
  PlatformSettingsUpdatePayload,
} from "../types/settings.types";

export const settingsApi = {
  get: () =>
    apiClient<PlatformSettingsResponse>("/api/admin/settings", { method: "GET" }),

  update: (payload: PlatformSettingsUpdatePayload) =>
    apiClient<PlatformSettingsMutationResponse>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),
};
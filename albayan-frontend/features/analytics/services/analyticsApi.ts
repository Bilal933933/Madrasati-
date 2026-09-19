import { apiClient } from "@/lib/apiClient";
import type { AnalyticsSummaryResponse } from "../types/analytics.types";

export const analyticsApi = {
  summary: () =>
    apiClient<AnalyticsSummaryResponse>("/api/admin/analytics/summary", {
      method: "GET",
    }),
};
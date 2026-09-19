import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../services/analyticsApi";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["admin-analytics-summary"],
    queryFn: () => analyticsApi.summary(),
  });
}
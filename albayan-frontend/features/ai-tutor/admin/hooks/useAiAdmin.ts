import { useQuery } from "@tanstack/react-query";
import { aiAdminApi } from "../services/aiAdminApi";

export function useAiAdminStats() {
  return useQuery({
    queryKey: ["admin-ai-threads", "stats"],
    queryFn: () => aiAdminApi.stats(),
  });
}

export function useAiAdminThreads(params: {
  page: number;
  perPage: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-ai-threads", params],
    queryFn: () => aiAdminApi.list(params),
  });
}

export function useAiAdminThreadDetail(id: string | null) {
  return useQuery({
    queryKey: ["admin-ai-threads", "detail", id],
    queryFn: () => aiAdminApi.detail(id as string),
    enabled: id !== null,
  });
}
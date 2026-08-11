import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiThreadSummary } from "../types/ai-chat.types";
import {
  createAiThread,
  deleteAiThread,
  listAiThreads,
} from "../services/aiApi";

export function useAiThreads() {
  return useQuery({
    queryKey: ["ai-threads"],
    queryFn: () => listAiThreads(),
  });
}

export function useCreateAiThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createAiThread(),
    onSuccess: (thread) => {
      queryClient.setQueryData<AiThreadSummary[]>(["ai-threads"], (existing) => [
        ...(existing ?? []),
        {
          id: thread.id,
          title: thread.title ?? "محادثة جديدة",
          updatedAt: thread.updatedAt,
          messageCount: 0,
          lastMessage: null,
        },
      ]);
    },
  });
}

export function useDeleteAiThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => deleteAiThread(threadId),
    onSuccess: (_data, threadId) => {
      queryClient.setQueryData<AiThreadSummary[]>(["ai-threads"], (existing) =>
        existing?.filter((t) => t.id !== threadId) ?? existing
      );
    },
  });
}

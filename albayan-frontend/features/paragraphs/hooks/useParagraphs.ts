import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { paragraphsApi, type ParagraphListFilters } from "../services/paragraphsApi";
import type { ParagraphPayload } from "../types/paragraph.types";

export function useParagraphs(filters?: ParagraphListFilters) {
  return useQuery({
    queryKey: ["paragraphs", filters ?? {}],
    queryFn: () => paragraphsApi.listParagraphs(filters),
  });
}

export function useNextParagraphOrder(enabled: boolean, lessonId?: number) {
  return useQuery({
    queryKey: ["paragraphs", "next-order", lessonId],
    queryFn: () => paragraphsApi.nextOrder(lessonId ?? 0),
    enabled: enabled && lessonId != null && !Number.isNaN(lessonId),
  });
}

export function useCreateParagraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ParagraphPayload) => paragraphsApi.createParagraph(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الفقرة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["paragraphs"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateParagraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ParagraphPayload }) =>
      paragraphsApi.updateParagraph(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الفقرة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["paragraphs"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteParagraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paragraphsApi.deleteParagraph(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الفقرة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["paragraphs"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

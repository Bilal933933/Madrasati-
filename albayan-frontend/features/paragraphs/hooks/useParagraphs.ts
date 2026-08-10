import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
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

const INVALIDATE_KEYS: QueryKey[] = [["paragraphs"]];

export function useCreateParagraph() {
  return useResourceMutation({
    mutationFn: paragraphsApi.createParagraph,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء الفقرة بنجاح.",
  });
}

export function useUpdateParagraph() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ParagraphPayload }) =>
      paragraphsApi.updateParagraph(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث الفقرة بنجاح.",
  });
}

export function useDeleteParagraph() {
  return useResourceMutation({
    mutationFn: paragraphsApi.deleteParagraph,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف الفقرة بنجاح.",
  });
}
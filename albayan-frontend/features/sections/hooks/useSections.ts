import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { sectionsApi, type SectionListFilters } from "../services/sectionsApi";
import type { SectionPayload } from "../types/section.types";

export function useSections(filters?: SectionListFilters) {
  return useQuery({
    queryKey: ["sections", filters ?? {}],
    queryFn: () => sectionsApi.listSections(filters),
  });
}

export function useNextSectionOrder(enabled: boolean, subjectId?: number) {
  return useQuery({
    queryKey: ["sections", "next-order", subjectId],
    queryFn: () => sectionsApi.nextOrder(subjectId ?? 0),
    enabled: enabled && subjectId != null && !Number.isNaN(subjectId),
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionPayload) => sectionsApi.createSection(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الوحدة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SectionPayload }) =>
      sectionsApi.updateSection(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الوحدة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sectionsApi.deleteSection(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الوحدة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

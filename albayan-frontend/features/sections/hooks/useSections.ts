import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sectionsApi } from "../services/sectionsApi";
import type { SectionPayload } from "../types/section.types";

export function useSections() {
  return useQuery({
    queryKey: ["sections"],
    queryFn: sectionsApi.listSections,
  });
}

function errorMessage(error: unknown): string {
  return (error as { message?: string })?.message ?? "حدث خطأ غير متوقع.";
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
    },
  });
}

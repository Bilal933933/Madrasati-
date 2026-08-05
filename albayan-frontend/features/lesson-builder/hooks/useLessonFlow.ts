import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { lessonBuilderApi } from "../services/lessonBuilderApi";
import type { AddBlockPayload } from "../types/lesson-builder.types";

export function useLessonFlow(lessonId: number) {
  return useQuery({
    queryKey: ["lesson-flow", lessonId],
    queryFn: () => lessonBuilderApi.getFlow(lessonId),
  });
}

export function useAddBlock(lessonId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddBlockPayload) => lessonBuilderApi.addBlock(lessonId, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تمت إضافة العنصر إلى الرحلة.");
      queryClient.invalidateQueries({ queryKey: ["lesson-flow", lessonId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useReorderBlocks(lessonId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => lessonBuilderApi.reorder(lessonId, ids),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث ترتيب العناصر.");
      queryClient.invalidateQueries({ queryKey: ["lesson-flow", lessonId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleBlock(lessonId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      lessonBuilderApi.toggle(id, isPublished),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث حالة العرض.");
      queryClient.invalidateQueries({ queryKey: ["lesson-flow", lessonId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteBlock(lessonId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lessonBuilderApi.removeBlock(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف العنصر من الرحلة.");
      queryClient.invalidateQueries({ queryKey: ["lesson-flow", lessonId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
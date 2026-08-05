import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { lessonsApi, type LessonListFilters } from "../services/lessonsApi";
import type { LessonPayload } from "../types/lesson.types";

export function useLessons(filters?: LessonListFilters) {
  return useQuery({
    queryKey: ["lessons", filters ?? {}],
    queryFn: () => lessonsApi.listLessons(filters),
  });
}

export function useLesson(id: number) {
  return useQuery({
    queryKey: ["lessons", { id }],
    queryFn: () => lessonsApi.getLesson(id),
    enabled: id > 0,
  });
}

export function useNextLessonOrder(enabled: boolean, courseId?: number) {
  return useQuery({
    queryKey: ["lessons", "next-order", courseId],
    queryFn: () => lessonsApi.nextOrder(courseId ?? 0),
    enabled: enabled && courseId != null && !Number.isNaN(courseId),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LessonPayload) => lessonsApi.createLesson(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الدرس بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonPayload }) =>
      lessonsApi.updateLesson(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الدرس بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lessonsApi.deleteLesson(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الدرس بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

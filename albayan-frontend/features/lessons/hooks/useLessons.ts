import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { lessonsApi } from "../services/lessonsApi";
import type { LessonPayload } from "../types/lesson.types";

export function useLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: lessonsApi.listLessons,
  });
}

function errorMessage(error: unknown): string {
  return (error as { message?: string })?.message ?? "حدث خطأ غير متوقع.";
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { coursesApi } from "../services/coursesApi";
import type { CoursePayload } from "../types/course.types";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.listCourses,
  });
}

function errorMessage(error: unknown): string {
  return (error as { message?: string })?.message ?? "حدث خطأ غير متوقع.";
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CoursePayload) => coursesApi.createCourse(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء المقرر بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CoursePayload }) =>
      coursesApi.updateCourse(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث المقرر بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => coursesApi.deleteCourse(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف المقرر بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

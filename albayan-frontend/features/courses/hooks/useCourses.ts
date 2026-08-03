import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { coursesApi, type CourseListFilters } from "../services/coursesApi";
import type { CoursePayload } from "../types/course.types";

export function useCourses(filters?: CourseListFilters) {
  return useQuery({
    queryKey: ["courses", filters ?? {}],
    queryFn: () => coursesApi.listCourses(filters),
  });
}

export function useNextCourseOrder(enabled: boolean, sectionId?: number) {
  return useQuery({
    queryKey: ["courses", "next-order", sectionId],
    queryFn: () => coursesApi.nextOrder(sectionId ?? 0),
    enabled: enabled && sectionId != null && !Number.isNaN(sectionId),
  });
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
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
    },
  });
}

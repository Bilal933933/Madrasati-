import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { coursesApi, type CourseListFilters } from "../services/coursesApi";
import type { CoursePayload } from "../types/course.types";

export function useCourses(filters?: CourseListFilters) {
  return useQuery({
    queryKey: ["courses", filters ?? {}],
    queryFn: () => coursesApi.listCourses(filters),
  });
}

export function useNextCourseOrder(enabled: boolean, subjectId?: number) {
  return useQuery({
    queryKey: ["courses", "next-order", subjectId],
    queryFn: () => coursesApi.nextOrder(subjectId ?? 0),
    enabled: enabled && subjectId != null && !Number.isNaN(subjectId),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["courses"]];

export function useCreateCourse() {
  return useResourceMutation({
    mutationFn: coursesApi.createCourse,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء المقرر بنجاح.",
  });
}

export function useUpdateCourse() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CoursePayload }) =>
      coursesApi.updateCourse(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث المقرر بنجاح.",
  });
}

export function useDeleteCourse() {
  return useResourceMutation({
    mutationFn: coursesApi.deleteCourse,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف المقرر بنجاح.",
  });
}
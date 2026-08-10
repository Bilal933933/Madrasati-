import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
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

const INVALIDATE_KEYS: QueryKey[] = [["lessons"]];

export function useCreateLesson() {
  return useResourceMutation({
    mutationFn: lessonsApi.createLesson,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء الدرس بنجاح.",
  });
}

export function useUpdateLesson() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonPayload }) =>
      lessonsApi.updateLesson(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث الدرس بنجاح.",
  });
}

export function useDeleteLesson() {
  return useResourceMutation({
    mutationFn: lessonsApi.deleteLesson,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف الدرس بنجاح.",
  });
}
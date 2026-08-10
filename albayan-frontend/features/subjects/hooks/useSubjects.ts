import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { subjectsApi, type SubjectListFilters } from "../services/subjectsApi";
import type { SubjectPayload } from "../types/subject.types";

export function useSubjects(filters?: SubjectListFilters) {
  return useQuery({
    queryKey: ["subjects", filters ?? {}],
    queryFn: () => subjectsApi.listSubjects(filters),
  });
}

export function useNextSubjectOrder(enabled: boolean, gradeId?: number) {
  return useQuery({
    queryKey: ["subjects", "next-order", gradeId],
    queryFn: () => subjectsApi.nextOrder(gradeId ?? 0),
    enabled: enabled && gradeId != null && !Number.isNaN(gradeId),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["subjects"]];

export function useCreateSubject() {
  return useResourceMutation({
    mutationFn: subjectsApi.createSubject,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء المادة بنجاح.",
  });
}

export function useUpdateSubject() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubjectPayload }) =>
      subjectsApi.updateSubject(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث المادة بنجاح.",
  });
}

export function useDeleteSubject() {
  return useResourceMutation({
    mutationFn: subjectsApi.deleteSubject,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف المادة بنجاح.",
  });
}
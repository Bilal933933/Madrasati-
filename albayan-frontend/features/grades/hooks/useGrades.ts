import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { gradesApi, type GradeListFilters } from "../services/gradesApi";
import type { GradePayload } from "../types/grade.types";

export function useGrades(filters?: GradeListFilters) {
  return useQuery({
    queryKey: ["grades", filters ?? {}],
    queryFn: () => gradesApi.listGrades(filters),
  });
}

export function useNextGradeOrder(enabled: boolean, stageId?: number) {
  return useQuery({
    queryKey: ["grades", "next-order", stageId],
    queryFn: () => gradesApi.nextOrder(stageId ?? 0),
    enabled: enabled && stageId != null && !Number.isNaN(stageId),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["grades"]];

export function useCreateGrade() {
  return useResourceMutation({
    mutationFn: gradesApi.createGrade,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء الصف بنجاح.",
  });
}

export function useUpdateGrade() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GradePayload }) =>
      gradesApi.updateGrade(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث الصف بنجاح.",
  });
}

export function useDeleteGrade() {
  return useResourceMutation({
    mutationFn: gradesApi.deleteGrade,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف الصف بنجاح.",
  });
}
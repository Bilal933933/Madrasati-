import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { semestersApi, type SemesterListFilters } from "../services/semestersApi";
import type { SemesterPayload } from "../types/semester.types";

export function useSemesters(filters?: SemesterListFilters) {
  return useQuery({
    queryKey: ["semesters", filters ?? {}],
    queryFn: () => semestersApi.listSemesters(filters),
  });
}

export function useNextSemesterOrder(enabled: boolean, gradeId?: number) {
  return useQuery({
    queryKey: ["semesters", "next-order", gradeId],
    queryFn: () => semestersApi.nextOrder(gradeId ?? 0),
    enabled: enabled && gradeId != null && !Number.isNaN(gradeId),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["semesters"]];

export function useCreateSemester() {
  return useResourceMutation({
    mutationFn: semestersApi.createSemester,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء الفصل بنجاح.",
  });
}

export function useUpdateSemester() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SemesterPayload }) =>
      semestersApi.updateSemester(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث الفصل بنجاح.",
  });
}

export function useDeleteSemester() {
  return useResourceMutation({
    mutationFn: semestersApi.deleteSemester,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف الفصل بنجاح.",
  });
}
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import {
  examBlueprintsApi,
  type ExamBlueprintListFilters,
} from "../services/examsApi";
import type { ExamBlueprintPayload } from "../types/exam.types";

export function useExamBlueprints(filters?: ExamBlueprintListFilters) {
  return useQuery({
    queryKey: ["exam-blueprints", filters ?? {}],
    queryFn: () => examBlueprintsApi.listBlueprints(filters),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["exam-blueprints"]];

export function useCreateExamBlueprint() {
  return useResourceMutation({
    mutationFn: examBlueprintsApi.createBlueprint,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء تعريف الامتحان بنجاح.",
  });
}

export function useUpdateExamBlueprint() {
  return useResourceMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExamBlueprintPayload;
    }) => examBlueprintsApi.updateBlueprint(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث تعريف الامتحان بنجاح.",
  });
}

export function useDeleteExamBlueprint() {
  return useResourceMutation({
    mutationFn: examBlueprintsApi.deleteBlueprint,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف تعريف الامتحان بنجاح.",
  });
}
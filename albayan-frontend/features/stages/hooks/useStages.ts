import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { stagesApi } from "../services/stagesApi";
import type { StagePayload } from "../types/stage.types";

export function useStages() {
  return useQuery({
    queryKey: ["stages"],
    queryFn: stagesApi.listStages,
  });
}

export function useNextStageOrder(enabled: boolean) {
  return useQuery({
    queryKey: ["stages", "next-order"],
    queryFn: stagesApi.nextOrder,
    enabled,
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["stages"]];

export function useCreateStage() {
  return useResourceMutation({
    mutationFn: stagesApi.createStage,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء المرحلة بنجاح.",
  });
}

export function useUpdateStage() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StagePayload }) =>
      stagesApi.updateStage(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث المرحلة بنجاح.",
  });
}

export function useDeleteStage() {
  return useResourceMutation({
    mutationFn: stagesApi.deleteStage,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف المرحلة بنجاح.",
  });
}
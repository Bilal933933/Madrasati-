import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
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

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StagePayload) => stagesApi.createStage(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء المرحلة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StagePayload }) =>
      stagesApi.updateStage(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث المرحلة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stagesApi.deleteStage(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف المرحلة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

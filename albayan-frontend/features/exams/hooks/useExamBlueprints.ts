import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
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

export function useCreateExamBlueprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExamBlueprintPayload) =>
      examBlueprintsApi.createBlueprint(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء تعريف الامتحان بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["exam-blueprints"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateExamBlueprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExamBlueprintPayload;
    }) => examBlueprintsApi.updateBlueprint(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث تعريف الامتحان بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["exam-blueprints"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteExamBlueprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examBlueprintsApi.deleteBlueprint(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف تعريف الامتحان بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["exam-blueprints"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
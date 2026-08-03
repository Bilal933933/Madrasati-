import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
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

export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GradePayload) => gradesApi.createGrade(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الصف بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GradePayload }) =>
      gradesApi.updateGrade(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الصف بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => gradesApi.deleteGrade(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الصف بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

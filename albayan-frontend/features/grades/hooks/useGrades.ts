import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { gradesApi } from "../services/gradesApi";
import type { GradePayload } from "../types/grade.types";

export function useGrades() {
  return useQuery({
    queryKey: ["grades"],
    queryFn: gradesApi.listGrades,
  });
}

function errorMessage(error: unknown): string {
  return (error as { message?: string })?.message ?? "حدث خطأ غير متوقع.";
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
    },
  });
}

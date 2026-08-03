import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subjectsApi } from "../services/subjectsApi";
import type { SubjectPayload } from "../types/subject.types";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: subjectsApi.listSubjects,
  });
}

function errorMessage(error: unknown): string {
  return (error as { message?: string })?.message ?? "حدث خطأ غير متوقع.";
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubjectPayload) => subjectsApi.createSubject(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء المادة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubjectPayload }) =>
      subjectsApi.updateSubject(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث المادة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => subjectsApi.deleteSubject(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف المادة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

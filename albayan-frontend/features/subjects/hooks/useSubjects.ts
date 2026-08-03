import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
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

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubjectPayload) => subjectsApi.createSubject(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء المادة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
    },
  });
}

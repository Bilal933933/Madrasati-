import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
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

export function useCreateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SemesterPayload) => semestersApi.createSemester(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الفصل بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SemesterPayload }) =>
      semestersApi.updateSemester(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الفصل بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => semestersApi.deleteSemester(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الفصل بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

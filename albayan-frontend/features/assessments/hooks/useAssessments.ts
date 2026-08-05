import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import {
  assessmentsApi,
  type AssessmentListFilters,
} from "../services/assessmentsApi";
import type { AssessmentPayload } from "../types/assessment.types";

export function useAssessments(filters?: AssessmentListFilters) {
  return useQuery({
    queryKey: ["assessments", filters ?? {}],
    queryFn: () => assessmentsApi.listAssessments(filters),
  });
}

export function useAssessment(id: number | null) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => assessmentsApi.getAssessment(id as number),
    enabled: id != null,
  });
}

export function useNextAssessmentOrder(enabled: boolean, lessonId?: number) {
  return useQuery({
    queryKey: ["assessments", "next-order", lessonId],
    queryFn: () => assessmentsApi.nextOrder(lessonId ?? 0),
    enabled: enabled && lessonId != null && !Number.isNaN(lessonId),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssessmentPayload) => assessmentsApi.createAssessment(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء التقييم بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssessmentPayload }) =>
      assessmentsApi.updateAssessment(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث التقييم بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assessmentsApi.deleteAssessment(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف التقييم بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

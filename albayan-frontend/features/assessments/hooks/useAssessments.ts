import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
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

const INVALIDATE_KEYS: QueryKey[] = [["assessments"]];

export function useCreateAssessment() {
  return useResourceMutation({
    mutationFn: assessmentsApi.createAssessment,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء التقييم بنجاح.",
  });
}

export function useUpdateAssessment() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssessmentPayload }) =>
      assessmentsApi.updateAssessment(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث التقييم بنجاح.",
  });
}

export function useDeleteAssessment() {
  return useResourceMutation({
    mutationFn: assessmentsApi.deleteAssessment,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف التقييم بنجاح.",
  });
}
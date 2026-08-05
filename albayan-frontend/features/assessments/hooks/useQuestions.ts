import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { questionsApi } from "../services/assessmentsApi";
import type { QuestionPayload } from "../types/assessment.types";

export function useNextQuestionOrder(enabled: boolean, assessmentId?: number) {
  return useQuery({
    queryKey: ["questions", "next-order", assessmentId],
    queryFn: () => questionsApi.nextOrder(assessmentId ?? 0),
    enabled: enabled && assessmentId != null && !Number.isNaN(assessmentId),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuestionPayload) => questionsApi.createQuestion(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: QuestionPayload }) =>
      questionsApi.updateQuestion(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => questionsApi.deleteQuestion(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

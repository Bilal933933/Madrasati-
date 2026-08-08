import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import {
  bankQuestionsApi,
  type BankQuestionListFilters,
} from "../services/examsApi";
import type { BankQuestionPayload } from "../types/exam.types";

export function useBankQuestions(filters?: BankQuestionListFilters) {
  return useQuery({
    queryKey: ["bank-questions", filters ?? {}],
    queryFn: () => bankQuestionsApi.listQuestions(filters),
  });
}

export function useCreateBankQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BankQuestionPayload) =>
      bankQuestionsApi.createQuestion(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["bank-questions"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateBankQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BankQuestionPayload }) =>
      bankQuestionsApi.updateQuestion(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["bank-questions"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteBankQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bankQuestionsApi.deleteQuestion(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["bank-questions"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
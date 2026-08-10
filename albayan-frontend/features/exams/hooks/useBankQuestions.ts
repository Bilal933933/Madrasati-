import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
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

const INVALIDATE_KEYS: QueryKey[] = [["bank-questions"]];

export function useCreateBankQuestion() {
  return useResourceMutation({
    mutationFn: bankQuestionsApi.createQuestion,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء السؤال بنجاح.",
  });
}

export function useUpdateBankQuestion() {
  return useResourceMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: BankQuestionPayload;
    }) => bankQuestionsApi.updateQuestion(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث السؤال بنجاح.",
  });
}

export function useDeleteBankQuestion() {
  return useResourceMutation({
    mutationFn: bankQuestionsApi.deleteQuestion,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف السؤال بنجاح.",
  });
}
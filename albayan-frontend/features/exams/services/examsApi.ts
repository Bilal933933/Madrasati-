import { apiClient } from "@/lib/apiClient";
import type {
  BankQuestionDeleteResponse,
  BankQuestionListResponse,
  BankQuestionMutationResponse,
  BankQuestionPayload,
  BankQuestionResponse,
  Difficulty,
  ExamBlueprintDeleteResponse,
  ExamBlueprintListResponse,
  ExamBlueprintMutationResponse,
  ExamBlueprintPayload,
  ExamBlueprintResponse,
  ExamType,
  QuestionType,
} from "../types/exam.types";

export interface BankQuestionListFilters {
  lessonId?: number;
  difficulty?: Difficulty;
  type?: QuestionType;
}

function buildBankQuery(filters?: BankQuestionListFilters): string {
  const params = new URLSearchParams();
  if (filters?.lessonId) params.set("lesson_id", String(filters.lessonId));
  if (filters?.difficulty) params.set("difficulty", filters.difficulty);
  if (filters?.type) params.set("type", filters.type);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export interface ExamBlueprintListFilters {
  examType?: ExamType;
  activeOnly?: boolean;
}

function buildBlueprintQuery(filters?: ExamBlueprintListFilters): string {
  const params = new URLSearchParams();
  if (filters?.examType) params.set("exam_type", filters.examType);
  if (filters?.activeOnly) params.set("active_only", "1");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const bankQuestionsApi = {
  listQuestions: (filters?: BankQuestionListFilters) =>
    apiClient<BankQuestionListResponse>(
      `/api/admin/bank-questions${buildBankQuery(filters)}`,
      { method: "GET" }
    ),

  getQuestion: (id: number) =>
    apiClient<BankQuestionResponse>(`/api/admin/bank-questions/${id}`, {
      method: "GET",
    }),

  createQuestion: (payload: BankQuestionPayload) =>
    apiClient<BankQuestionMutationResponse>("/api/admin/bank-questions", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateQuestion: (id: number, payload: BankQuestionPayload) =>
    apiClient<BankQuestionMutationResponse>(`/api/admin/bank-questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteQuestion: (id: number) =>
    apiClient<BankQuestionDeleteResponse>(`/api/admin/bank-questions/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

export const examBlueprintsApi = {
  listBlueprints: (filters?: ExamBlueprintListFilters) =>
    apiClient<ExamBlueprintListResponse>(
      `/api/admin/exam-blueprints${buildBlueprintQuery(filters)}`,
      { method: "GET" }
    ),

  getBlueprint: (id: number) =>
    apiClient<ExamBlueprintResponse>(`/api/admin/exam-blueprints/${id}`, {
      method: "GET",
    }),

  createBlueprint: (payload: ExamBlueprintPayload) =>
    apiClient<ExamBlueprintMutationResponse>("/api/admin/exam-blueprints", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateBlueprint: (id: number, payload: ExamBlueprintPayload) =>
    apiClient<ExamBlueprintMutationResponse>(`/api/admin/exam-blueprints/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteBlueprint: (id: number) =>
    apiClient<ExamBlueprintDeleteResponse>(`/api/admin/exam-blueprints/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};
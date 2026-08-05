import { apiClient } from "@/lib/apiClient";
import { buildListQuery } from "@/lib/query";
import type {
  AssessmentDeleteResponse,
  AssessmentListResponse,
  AssessmentMutationResponse,
  AssessmentPayload,
  AssessmentType,
  NextOrderResponse,
  OptionDeleteResponse,
  OptionMutationResponse,
  OptionPayload,
  QuestionDeleteResponse,
  QuestionMutationResponse,
  QuestionPayload,
} from "../types/assessment.types";

export interface AssessmentListFilters {
  lessonId?: number;
  paragraphId?: number;
  type?: AssessmentType;
}

export const assessmentsApi = {
  listAssessments: (filters?: AssessmentListFilters) =>
    apiClient<AssessmentListResponse>(
      "/api/admin/assessments" +
        buildListQuery({
          lesson_id: filters?.lessonId,
          paragraph_id: filters?.paragraphId,
        }),
      {
        method: "GET",
      }
    ),

  getAssessment: (id: number) =>
    apiClient<AssessmentMutationResponse>(`/api/admin/assessments/${id}`, {
      method: "GET",
    }),

  nextOrder: (lessonId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/assessments/next-order" + buildListQuery({ lesson_id: lessonId }),
      {
        method: "GET",
      }
    ),

  createAssessment: (payload: AssessmentPayload) =>
    apiClient<AssessmentMutationResponse>("/api/admin/assessments", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateAssessment: (id: number, payload: AssessmentPayload) =>
    apiClient<AssessmentMutationResponse>(`/api/admin/assessments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteAssessment: (id: number) =>
    apiClient<AssessmentDeleteResponse>(`/api/admin/assessments/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

export const questionsApi = {
  nextOrder: (assessmentId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/questions/next-order" + buildListQuery({ assessment_id: assessmentId }),
      {
        method: "GET",
      }
    ),

  createQuestion: (payload: QuestionPayload) =>
    apiClient<QuestionMutationResponse>("/api/admin/questions", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateQuestion: (id: number, payload: QuestionPayload) =>
    apiClient<QuestionMutationResponse>(`/api/admin/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteQuestion: (id: number) =>
    apiClient<QuestionDeleteResponse>(`/api/admin/questions/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

export const optionsApi = {
  nextOrder: (questionId: number) =>
    apiClient<NextOrderResponse>(
      "/api/admin/options/next-order" + buildListQuery({ question_id: questionId }),
      {
        method: "GET",
      }
    ),

  createOption: (payload: OptionPayload) =>
    apiClient<OptionMutationResponse>("/api/admin/options", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateOption: (id: number, payload: OptionPayload) =>
    apiClient<OptionMutationResponse>(`/api/admin/options/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  deleteOption: (id: number) =>
    apiClient<OptionDeleteResponse>(`/api/admin/options/${id}`, {
      method: "DELETE",
      withCsrf: true,
    }),
};

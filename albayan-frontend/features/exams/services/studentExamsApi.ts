import { apiClient } from "@/lib/apiClient";
import type {
  ExamBlueprint,
  ExamBlueprintListResponse,
  ExamBlueprintResponse,
} from "../types/exam.types";
import type {
  ExamAttemptDetailResponse,
  ExamAttemptHistoryResponse,
  ExamAttemptListResponse,
  ExamAttemptStartResponse,
  SaveAnswerPayload,
  SaveAnswerResponse,
  SaveProgressPayload,
  SaveProgressResponse,
  SubmitAttemptResponse,
} from "../types/attempt.types";

/**
 * مسارات الامتحانات للمستخدم المسجّل — محمية بـ auth:sanctum في الباك.
 */
export const studentExamsApi = {
  /** الامتحانات المتاحة (نشطة فقط) مع حالة الفتح والتقدّم وأفضل نتيجة. */
  listExams: () =>
    apiClient<ExamBlueprintListResponse>("/api/exams", { method: "GET" }),

  /** تفاصيل امتحان + فتح النطاق + عدد المحاولات المتبقية + أفضل نتيجة. */
  getExam: (id: number) =>
    apiClient<ExamBlueprintResponse>(`/api/exams/${id}`, { method: "GET" }),

  /** سجل محاولات الطالب على امتحان واحد. */
  myAttempts: (id: number) =>
    apiClient<ExamAttemptListResponse>(`/api/exams/${id}/attempts`, {
      method: "GET",
    }),

  /** سجل كل محاولات الطالب عبر كل الامتحانات + إحصائيات. */
  listAllAttempts: () =>
    apiClient<ExamAttemptHistoryResponse>("/api/exams/attempts", {
      method: "GET",
    }),

  /** بدء محاولة جديدة — يُرجع تفاصيل المحاولة بكل أسئلتها. */
  startAttempt: (id: number) =>
    apiClient<ExamAttemptStartResponse>(`/api/exams/${id}/start`, {
      method: "POST",
      withCsrf: true,
    }),

  /** تفاصيل محاولة أثناء الأداء أو المراجعة (حسب إذن الكشف). */
  getAttempt: (attemptId: number) =>
    apiClient<ExamAttemptDetailResponse>(`/api/exams/attempts/${attemptId}`, {
      method: "GET",
    }),

  /** حفظ إجابة سؤال في محاولة جارية. */
  saveAnswer: (attemptId: number, questionId: number, payload: SaveAnswerPayload) =>
    apiClient<SaveAnswerResponse>(
      `/api/exams/attempts/${attemptId}/questions/${questionId}`,
      { method: "PUT", body: JSON.stringify(payload), withCsrf: true }
    ),

  /** حفظ تقدم المحاولة (الموضع الحالي + الأسئلة المعلَّمة). */
  saveProgress: (attemptId: number, payload: SaveProgressPayload) =>
    apiClient<SaveProgressResponse>(
      `/api/exams/attempts/${attemptId}/progress`,
      { method: "PUT", body: JSON.stringify(payload), withCsrf: true }
    ),

  /** تسليم المحاولة نهائيًا مع التصحيح الفوري. */
  submitAttempt: (attemptId: number) =>
    apiClient<SubmitAttemptResponse>(`/api/exams/attempts/${attemptId}/submit`, {
      method: "POST",
      withCsrf: true,
    }),
};

export type { ExamBlueprint };
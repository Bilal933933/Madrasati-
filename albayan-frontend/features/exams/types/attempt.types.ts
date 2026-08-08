import type { ExamBlueprint, QuestionType } from "./exam.types";

export type AttemptStatus = "in_progress" | "completed";

export interface AttemptQuestionOption {
  id: number;
  content: string;
}

export interface AttemptQuestion {
  id: number;
  type: QuestionType | null;
  content: string | null;
  sort_order: number;
  /** خيارات سؤال الاختيار من متعدد — فارغة لسؤال صح/خطأ. */
  options: AttemptQuestionOption[];
  selected_option_id: number | null;
  selected_boolean: boolean | null;
  /** حقول الكشف — تظهر فقط بعد التسليم إذا كان المراجعة مفعّلة. */
  is_correct?: boolean | null;
  correct_option_id?: number | null;
  correct_boolean?: boolean | null;
  explanation?: string | null;
}

export interface ExamAttemptDetail {
  id: number;
  blueprint_id: number;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string | null;
  deadline_at: string | null;
  submitted_at: string | null;
  duration_minutes: number | null;
  total_questions: number;
  correct_count: number;
  score_percentage: number | null;
  passed: boolean | null;
  revealed: boolean;
  current_index: number;
  flagged_question_ids: number[];
  questions: AttemptQuestion[];
}

export interface ExamAttemptSummary {
  id: number;
  blueprint: ExamBlueprint | null;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string | null;
  deadline_at: string | null;
  submitted_at: string | null;
  total_questions: number;
  correct_count: number;
  score_percentage: number | null;
  passed: boolean | null;
}

export interface ExamAttemptListResponse {
  data: ExamAttemptSummary[];
}

export interface ExamAttemptDetailResponse {
  data: ExamAttemptDetail;
}

export interface ExamAttemptStartResponse {
  data: ExamAttemptDetail;
  message: string;
}

export interface SaveAnswerPayload {
  selected_option_id?: number | null;
  selected_boolean?: boolean | null;
}

export interface SaveAnswerResponse {
  data: {
    question_id: number;
    selected_option_id: number | null;
    selected_boolean: boolean | null;
  };
  message: string;
}

export interface SaveProgressPayload {
  current_index: number;
  flagged_question_ids: number[];
}

export interface SaveProgressResponse {
  data: {
    current_index: number;
    flagged_question_ids: number[];
  };
  message: string;
}

export interface SubmitAttemptResponse {
  data: ExamAttemptSummary;
  message: string;
}

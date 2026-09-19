import type { ExamBlueprint, QuestionType } from "./exam.types";
import type { AchievementUnlocksPayload } from "@/features/achievements/types/achievement.types";

export type AttemptStatus = "in_progress" | "submitted" | "graded";

export interface AttemptQuestionOption {
  id: number;
  content: string;
}

export interface AiGradeResult {
  correct?: boolean;
  confidence?: number;
  feedback?: string;
  score_percent?: number;
  criteria?: { criterion: string; score: number; comment: string }[];
  strengths?: string[];
  improvements?: string[];
  accepted?: boolean;
  score_hint?: number;
  status?: "graded" | "error" | "pending_manual";
}

export interface AttemptQuestion {
  id: number;
  type: QuestionType | null;
  content: string | null;
  sort_order: number;
  options: AttemptQuestionOption[];
  selected_option_id: number | null;
  selected_boolean: boolean | null;
  selected_text: string | null;
  is_correct?: boolean | null;
  correct_option_id?: number | null;
  correct_boolean?: boolean | null;
  explanation?: string | null;
  score?: number | null;
  model_answer?: string | null;
  accepted_answers?: string[];
  rubric?: { criterion: string }[];
  correct_value?: number | null;
  tolerance?: number;
  units?: string | null;
  ai_grade?: AiGradeResult | null;
}

export interface ExamAttemptDetail {
  id: number;
  blueprint_id: number;
  attempt_number: number;
  status: "in_progress" | "completed";
  attempt_status: AttemptStatus;
  started_at: string | null;
  deadline_at: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  duration_minutes: number | null;
  total_questions: number;
  correct_count: number;
  total_score?: number | null;
  max_score?: number | null;
  percentage?: number | null;
  score_percentage: number | null;
  passed: boolean | null;
  revealed: boolean;
  is_locked?: boolean;
  current_index: number;
  flagged_question_ids: number[];
  questions: AttemptQuestion[];
}

export interface ExamAttemptSummary {
  id: number;
  blueprint: ExamBlueprint | null;
  exam_title: string | null;
  exam_type: ExamBlueprint["exam_type"] | null;
  exam_type_label: string | null;
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

export interface AttemptStats {
  total: number;
  completed: number;
  in_progress: number;
  average_percentage: number | null;
}

export interface ExamAttemptHistoryResponse {
  data: ExamAttemptSummary[];
  stats: AttemptStats;
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
  selected_text?: string | null;
}

export interface SaveAnswerResponse {
  data: {
    question_id: number;
    selected_option_id: number | null;
    selected_boolean: boolean | null;
    selected_text: string | null;
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

export interface SubmitAttemptResponse
  extends AchievementUnlocksPayload {
  data: ExamAttemptSummary;
  message: string;
}

export interface GradingStatusResponse {
  attempt_id: number;
  status: AttemptStatus;
  graded_at: string | null;
  total_score: number | null;
  max_score: number | null;
  percentage: number | null;
  grading_errors: string | null;
}

export interface ExamResultResponse {
  data: ExamAttemptDetail;
}
export type ExamType = "lesson" | "unit" | "monthly" | "semester" | "full";

export type QuestionType = "mcq" | "true_false";

export type Difficulty = "easy" | "medium" | "hard";

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  lesson: "امتحان الدرس",
  unit: "امتحان الوحدة",
  monthly: "امتحان شهري",
  semester: "امتحان فصلي",
  full: "امتحان شامل",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "اختيار من متعدد",
  true_false: "صح وخطأ",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

export interface BankQuestionOption {
  id: number;
  bank_question_id: number;
  content: string;
  is_correct: boolean;
  sort_order: number;
}

export interface BankQuestion {
  id: number;
  lesson_id: number;
  lesson_title: string | null;
  type: QuestionType;
  content: string;
  explanation: string | null;
  correct_answer: boolean | null;
  difficulty: Difficulty;
  is_active: boolean;
  options: BankQuestionOption[];
  created_at: string | null;
}

export interface BankQuestionOptionPayload {
  content: string;
  is_correct: boolean;
}

export interface BankQuestionPayload {
  lesson_id: number;
  type: QuestionType;
  content: string;
  explanation?: string | null;
  difficulty: Difficulty;
  correct_answer?: boolean | null;
  is_active?: boolean;
  options?: BankQuestionOptionPayload[];
}

export interface BankQuestionListResponse {
  data: BankQuestion[];
}

export interface BankQuestionResponse {
  data: BankQuestion;
}

export interface BankQuestionMutationResponse {
  data: BankQuestion;
  message: string;
}

export interface BankQuestionDeleteResponse {
  message: string;
}

export interface ExamBlueprint {
  id: number;
  exam_type: ExamType;
  exam_type_label: string | null;
  title: string;
  description: string | null;
  scope_name: string | null;
  lesson_id: number | null;
  course_id: number | null;
  subject_id: number | null;
  grade_id: number | null;
  stage_id: number | null;
  month_no: number | null;
  duration_minutes: number;
  attempts_allowed: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  total_questions: number;
  pass_threshold_percent: number;
  show_review_after_submit: boolean;
  is_active: boolean;
  requires_completion: boolean;
  unlock_progress: number | null;
  attempts_left: number | null;
  best_score: number | null;
  created_at: string | null;
}

export interface ExamBlueprintPayload {
  exam_type: ExamType;
  title: string;
  description?: string | null;
  lesson_id?: number | null;
  course_id?: number | null;
  subject_id?: number | null;
  grade_id?: number | null;
  stage_id?: number | null;
  month_no?: number | null;
  duration_minutes: number;
  attempts_allowed: number;
  easy_count?: number;
  medium_count?: number;
  hard_count?: number;
  pass_threshold_percent: number;
  show_review_after_submit?: boolean;
  is_active?: boolean;
  requires_completion?: boolean;
}

export interface ExamBlueprintListResponse {
  data: ExamBlueprint[];
}

export interface ExamBlueprintResponse {
  data: ExamBlueprint;
}

export interface ExamBlueprintMutationResponse {
  data: ExamBlueprint;
  message: string;
}

export interface ExamBlueprintDeleteResponse {
  message: string;
}
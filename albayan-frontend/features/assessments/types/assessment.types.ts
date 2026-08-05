export type AssessmentType = "pre" | "formative" | "final";
export type QuestionType = "mcq" | "true_false";

export interface Option {
  id: number;
  question_id: number;
  content: string;
  sort_order: number | null;
  is_correct?: boolean;
}

export interface Question {
  id: number;
  assessment_id: number;
  type: QuestionType;
  content: string;
  explanation: string | null;
  sort_order: number | null;
  correct_answer?: boolean | null;
  options?: Option[];
}

export interface Assessment {
  id: number;
  lesson_id: number;
  paragraph_id: number | null;
  type: AssessmentType;
  title: string | null;
  sort_order: number | null;
  questions?: Question[];
}

export interface AssessmentPayload {
  lesson_id: number;
  paragraph_id?: number | null;
  type: AssessmentType;
  title?: string | null;
  sort_order?: number | null;
}

export interface QuestionPayload {
  assessment_id: number;
  type: QuestionType;
  content: string;
  explanation?: string | null;
  correct_answer?: boolean | null;
  sort_order?: number | null;
}

export interface OptionPayload {
  question_id: number;
  content: string;
  is_correct: boolean;
  sort_order?: number | null;
}

export interface AssessmentListResponse {
  data: Assessment[];
}

export interface AssessmentMutationResponse {
  data: Assessment;
  message: string;
}

export interface AssessmentDeleteResponse {
  message: string;
}

export interface QuestionMutationResponse {
  data: Question;
  message: string;
}

export interface QuestionDeleteResponse {
  message: string;
}

export interface OptionMutationResponse {
  data: Option;
  message: string;
}

export interface OptionDeleteResponse {
  message: string;
}

export interface NextOrderResponse {
  data: {
    next_order: number;
  };
}

import type { Assessment } from "@/features/assessments/types/assessment.types";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

export type LessonBlockKind =
  | "paragraph"
  | "pre_assessment"
  | "formative_assessment"
  | "lesson_video"
  | "final_assessment";

export interface LessonFlowLesson {
  id: number;
  course_id: number;
  course: string | null;
  subject: string | null;
  title: string;
  slug: string | null;
  summary: string | null;
  learning_objectives: string[] | null;
  image: string | null;
  video: string | null;
  video_embed: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface LessonVideoData {
  video: string | null;
  video_embed: string | null;
}

export type LessonBlockData = Paragraph | Assessment | LessonVideoData | null;

export interface LessonFlowBlock {
  id: number;
  kind: LessonBlockKind;
  sort_order: number;
  is_published: boolean;
  data: LessonBlockData;
}

export interface LessonFlow {
  lesson: LessonFlowLesson;
  blocks: LessonFlowBlock[];
}

export interface LessonFlowResponse {
  data: LessonFlow;
}

export interface AddBlockPayload {
  block_kind: LessonBlockKind;
  title?: string | null;
  content?: string | null;
  image?: string | null;
  video?: string | null;
  paragraph_id?: number | null;
}

export interface LessonFlowMutationResponse {
  data: LessonFlow;
  message: string;
}

export interface BlockKindOption {
  kind: LessonBlockKind;
  label: string;
  description: string;
}
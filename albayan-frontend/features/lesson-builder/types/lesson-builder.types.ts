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
  course_slug: string | null;
  subject: string | null;
  subject_slug: string | null;
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

/** ملخص الوحدة (المقرر) من تقدم المستخدم — يغذّي شاشة نهاية الوحدة (5.6). */
export interface LessonFlowUnitCourse {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  color: string | null;
}

export interface LessonFlowUnitCompletion {
  completed_count: number;
  total_count: number;
  progress: number;
  status: string;
  /** أول درس غير مكتمل في الوحدة — لتوجيه «الدرس التالي» بغضّ النظر عن الترتيب. */
  next_lesson: {
    id: number;
    slug: string | null;
    title: string;
  } | null;
}

/** الوحدة التالية في نفس المادة — لزر [ابدأ الوحدة التالية]. */
export interface LessonFlowNextCourse {
  id: number;
  name: string;
  slug: string | null;
  start_slug: string | null;
}

export interface LessonFlowUnit {
  course: LessonFlowUnitCourse;
  completion: LessonFlowUnitCompletion;
  next_course: LessonFlowNextCourse | null;
}

export interface LessonFlow {
  lesson: LessonFlowLesson;
  /** الدرس التالي في المقرر (للتنقل من شاشة النهاية) — null لآخر درس. */
  next_lesson: {
    id: number;
    slug: string | null;
    title: string;
    summary: string | null;
  } | null;
  /** امتحان الدرس النشط المرتبط — null إذا لم يكن للدرس اختبار. */
  lesson_exam: {
    id: number;
    title: string;
  } | null;
  /** ملخص الوحدة من تقدم المستخدم الحالي — لشاشة نهاية الوحدة (5.6). */
  unit: LessonFlowUnit | null;
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
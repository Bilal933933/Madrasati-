/**
 * محرك الدرس — منفّذ الرحلة التي يبنيها Lesson Builder، لا منشئها.
 *
 * الرحلة = [start] + كتل الـ Builder حرفيًا (content/assessment) + [finish].
 * لا يعيد المحرك ترتيب شيء، ولا يعرض تفاصيل تنفيذية (كتل) للطالب.
 */

import type { TiptapDoc } from "./tiptap-types";

export type { TiptapDoc };

/** شاشات الطالب الأربع — ما يراه الطالب فعلًا. */
export type LessonScreenKind = "start" | "content" | "assessment" | "finish";

/** أنواع التقييم — يوجّه عرض AssessmentStage وسلوك الانتقال. */
export type AssessmentMode = "pre" | "understanding" | "final";

/** أنواع كتل الـ Builder (من الباك) — يعرفها المحرك لتوزيع العرض فقط. */
export type BuilderBlockKind =
  | "paragraph"
  | "lesson_video"
  | "pre_assessment"
  | "formative_assessment"
  | "final_assessment";

export interface AssessmentQuestion {
  id: number;
  type: "mcq" | "true_false";
  content: string;
  explanation?: string | null;
  options: { id: number; content: string }[];
  /** معرّف الخيار الصحيح — يُكشف داخل تدفق الدرس للتغذية الفورية فقط. */
  correctOptionId?: number | null;
  /** الجواب الصحيح لصواب/خطأ — يُكشف داخل تدفق الدرس للتغذية الفورية فقط. */
  correctAnswer?: boolean | null;
}

/** البيانات التي تستهلكها شاشة المحتوى لكتلة ما. */
export type LessonContentData =
  | {
      kind: "paragraph";
      title?: string | null;
      content?: TiptapDoc | null;
      image?: string | null;
      /** فيديو/تضمين مرتبط بالفقرة — يُمكّن زر التبديل (صورة/فيديو). */
      url?: string | null;
      embed?: string | null;
    }
  | { kind: "lesson_video"; url?: string | null; embed?: string | null };

/** البيانات التي تستهلكها شاشة التقييم. */
export interface LessonAssessmentData {
  mode: AssessmentMode;
  questions: AssessmentQuestion[];
}

/** خطوة في رحلة المحرك — إحدى شاشات الطالب الأربع. */
export interface LessonFlowStep {
  id: string;
  screen: LessonScreenKind;
  /** كتلة الـ Builder المرتبطة (لشاشتي content/assessment فقط). */
  block?: {
    id: number;
    kind: BuilderBlockKind;
  };
  /** محتوى للشاشة: بيانات كتلة، أو بيانات تقدم شاشة البداية/النهاية. */
  content?:
    | { type: "content"; data: LessonContentData }
    | { type: "assessment"; data: LessonAssessmentData }
    | { type: "none" };
}

/** بيانات الدرس كما يبنيها الـ Mapper من LessonFlowResource. */
export interface LessonEngineData {
  lessonId: number;
  title: string;
  color: string | null;
  image: string | null;
  subject?: string;
  course?: string;
  objectives: string[];
  summary?: string;
  flow: LessonFlowStep[];
}

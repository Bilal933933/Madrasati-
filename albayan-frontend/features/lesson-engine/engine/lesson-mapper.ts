import type { LessonFlow, LessonFlowBlock } from "@/features/lesson-builder/types/lesson-builder.types";
import type {
  BuilderBlockKind,
  LessonAssessmentData,
  LessonContentData,
  LessonEngineData,
  LessonFlowStep,
} from "./types";
import { parseTiptap } from "./tiptap-utils";

interface RawOption {
  id: number;
  content: string;
  is_correct?: boolean;
}

interface RawQuestion {
  id: number;
  type?: string;
  content?: string;
  explanation?: string | null;
  correct_answer?: boolean | null;
  options?: RawOption[];
}

/**
 * يحوّل رحلة الدرس (LessonFlowResource) إلى بيانات المحرك (LessonEngineData).
 *
 * المحرك منفّذ صامت للرحلة التي رتبها الـ Builder:
 *   flow = [start] + كتل الـ Builder كما هي (فقرة/فيديو <- content،
 *   تقييم <- assessment) + [finish]. لا يُدخل مراحل منطقية (intro/objectives/
 *   summary/completion) — لا يعيد اختراع الرحلة.
 */
export function mapLesson(flow: LessonFlow): LessonEngineData {
  const blocks = flow.blocks.filter((block) => block.is_published !== false);

  return {
    lessonId: flow.lesson.id,
    title: flow.lesson.title,
    color: flow.lesson.color,
    image: flow.lesson.image,
    subject: flow.lesson.subject ?? undefined,
    subjectSlug: flow.lesson.subject_slug ?? null,
    course: flow.lesson.course ?? undefined,
    courseSlug: flow.lesson.course_slug ?? null,
    objectives: flow.lesson.learning_objectives ?? [],
    summary: flow.lesson.summary ?? undefined,
    nextLesson: flow.next_lesson,
    lessonExam: flow.lesson_exam,
    unit: flow.unit,
    flow: buildFlow(blocks),
  };
}

/**
 * يبني الرحلة محترمًا ترتيب كتل الـ Builder حرفيًا:
 * start في البداية، finish في النهاية، والكتل كما هي بلا تعديل ترتيب.
 */
export function buildFlow(blocks: LessonFlowBlock[]): LessonFlowStep[] {
  const items: LessonFlowStep[] = [{ id: "start", screen: "start", content: { type: "none" } }];

  for (const block of blocks) {
    const step = stepFromBlock(block);
    if (step) {
      items.push(step);
    }
  }

  items.push({ id: "finish", screen: "finish", content: { type: "none" } });
  return items;
}

/** يوزّع الكتلة على الشاشة المناسبة بلا تغيير في نوعها. */
function stepFromBlock(block: LessonFlowBlock): LessonFlowStep | null {
  switch (block.kind) {
    case "paragraph":
      return contentStep(block, paragraphData(block));
    case "lesson_video":
      return contentStep(block, videoData(block));
    case "pre_assessment":
      return assessmentStep(block, "pre");
    case "formative_assessment":
      return assessmentStep(block, "understanding");
    case "final_assessment":
      return assessmentStep(block, "final");
    default:
      return null;
  }
}

function contentStep(block: LessonFlowBlock, data: LessonContentData): LessonFlowStep {
  return {
    id: String(block.id),
    screen: "content",
    block: { id: block.id, kind: block.kind as BuilderBlockKind },
    content: { type: "content", data },
  };
}

function paragraphData(block: LessonFlowBlock): LessonContentData {
  const p = block.data as {
    title?: string | null;
    content?: string | Record<string, unknown> | null;
    image?: string | null;
    video?: string | null;
    video_embed?: string | null;
  } | null;
  return {
    kind: "paragraph",
    title: p?.title ?? null,
    content: parseTiptap(normalizeContent(p?.content)),
    image: p?.image ?? null,
    url: p?.video ?? null,
    embed: p?.video_embed ?? null,
  };
}

/**
 * يسوّي محتوى الفقرة: الباك يعيده أحيانًا كسلسلة JSON وأحيانًا ككائن
 * مموّه (ParagraphResource يصدّر json_decode). نعيدهما إلى سلسلة لـ parseTiptap.
 */
function normalizeContent(content: string | Record<string, unknown> | null | undefined): string | null {
  if (!content) {
    return null;
  }
  if (typeof content === "string") {
    return content;
  }
  try {
    return JSON.stringify(content);
  } catch {
    return null;
  }
}

function videoData(block: LessonFlowBlock): LessonContentData {
  let url: string | null = null;
  let embed: string | null = null;
  if (block.data && "video" in block.data) {
    url = (block.data as { video: string | null }).video ?? null;
  }
  // الباك يسلّم video_embed (iframe يوتيوب) — يُعرض في شاشة المحتوى إن توفر.
  if (block.data && "video_embed" in block.data) {
    embed = (block.data as { video_embed: string | null }).video_embed ?? null;
  }
  return { kind: "lesson_video", url, embed };
}

function assessmentStep(block: LessonFlowBlock, mode: LessonAssessmentData["mode"]): LessonFlowStep {
  const data = block.data as
    | { type?: string; title?: string | null; questions?: RawQuestion[] }
    | null
    | undefined;
  const raw = data?.questions ?? [];
  const questions: LessonAssessmentData["questions"] = raw.map((q) => ({
    id: q.id,
    type: q.type === "true_false" ? "true_false" : "mcq",
    content: q.content ?? "",
    explanation: q.explanation,
    options: (q.options ?? []).map((o) => ({ id: o.id, content: o.content })),
    correctOptionId:
      q.type !== "true_false" ? (q.options?.find((o) => o.is_correct)?.id ?? null) : null,
    correctAnswer: q.type === "true_false" ? q.correct_answer ?? null : null,
  }));

  return {
    id: String(block.id),
    screen: "assessment",
    block: { id: block.id, kind: block.kind as BuilderBlockKind },
    content: { type: "assessment", data: { mode, questions } },
  };
}

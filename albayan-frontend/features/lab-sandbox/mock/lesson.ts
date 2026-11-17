import type { SandboxDoc } from "./paragraph";

/**
 * درس موك كامل يحاكي مسار محرك الدرس الحقيقي:
 * start ← content (يحتوي المختبر 3D) ← تقييم تكويني ← تقييم ختامي ← finish.
 *
 * البيانات ثابتة داخل المستودع، ولا تُطابق مخطط الباك — الغرض محاكاة الإيقاع
 * والواجهة فقط. الأسئلة بنفس شكل أسئلة المحرك (options + correctOptionId).
 */

export type SandboxAssessmentMode = "formative" | "final";

export interface SandboxQuestionOption {
  id: number;
  content: string;
}

export interface SandboxQuestion {
  id: string;
  kind: "mcq" | "true_false";
  prompt: string;
  options: SandboxQuestionOption[];
  correctOptionId: number;
  explanation: string;
}

interface SandboxStageBase {
  id: string;
  label: string;
}

export interface SandboxStartStage extends SandboxStageBase {
  screen: "start";
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  objectives: string[];
}

export interface SandboxContentStage extends SandboxStageBase {
  screen: "content";
  title: string;
  /**
   * محتوى الفقرة كما يصل من الباك (TipTap JSON).
   * المختبر 3D عقدة `interactive_lab` داخل هذا المستند، لا مكوّن ملتصق به.
   */
  content: SandboxDoc;
}

export interface SandboxAssessmentStage extends SandboxStageBase {
  screen: "assessment";
  mode: SandboxAssessmentMode;
  title: string;
  questions: SandboxQuestion[];
}

export interface SandboxFinishStage extends SandboxStageBase {
  screen: "finish";
  title: string;
  message: string;
}

export type SandboxLessonStage =
  | SandboxStartStage
  | SandboxContentStage
  | SandboxAssessmentStage
  | SandboxFinishStage;

export interface SandboxLesson {
  id: string;
  title: string;
  subject: string;
  stages: SandboxLessonStage[];
}

const TRUE_FALSE_OPTIONS: SandboxQuestionOption[] = [
  { id: 1, content: "صح" },
  { id: 0, content: "خطأ" },
];

export const MOCK_LESSON: SandboxLesson = {
  id: "energy-pendulum",
  title: "حفظ الطاقة وتداولها",
  subject: "الفيزياء",
  stages: [
    {
      id: "start",
      label: "البداية",
      screen: "start",
      title: "حفظ الطاقة وتداولها",
      subject: "الفيزياء",
      grade: "الصف الثالث المتوسط",
      durationMinutes: 12,
      objectives: [
        "أُميّز بين طاقة الوضع الجاذبية والطاقة الحركية.",
        "أُفسّر تحوّل الطاقة في البندول البسيط.",
        "أستنتج سبب ثبات الطاقة الكلية في النظام المغلق.",
        "أربط بين الكتلة والارتفاع والسرعة والطاقة.",
      ],
    },
    {
      id: "content-pendulum",
      label: "المحتوى",
      screen: "content",
      title: "البندول البسيط: تبادل الطاقة",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "الطاقة لا تفنى ولا تُستحدث من العدم، بل تتحوّل من شكل إلى آخر. في البندول تتبادل الكرة طاقتها بين طاقة الوضع الجاذبية والطاقة الحركية.",
              },
            ],
          },
          {
            type: "interactive_lab",
            attrs: {
              labKind: "pendulum",
              caption:
                "اسحب الكرة أو غيّر طول الخيط والكتلة، وراقب الأعمدة: مجموع Ep + Ek يبقى ثابتاً.",
            },
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "لماذا يبقى المجموع ثابتاً؟" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "عند رفع الكرة تكتسب طاقة وضع " },
              { type: "text", text: "Ep = mgh", marks: ["bold"] },
              { type: "text", text: "، وعند إفلاتها تتحوّل هذه الطاقة تدريجياً إلى طاقة حركية " },
              { type: "text", text: "Ek = ½mv²", marks: ["bold"] },
              { type: "text", text: "، ثم تعود إليها عند الطرف الآخر من المسار." },
            ],
          },
          {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "في النظام المغلق بلا احتكاك: " },
                  { type: "text", text: "Ep + Ek = Et", marks: ["bold"] },
                  { type: "text", text: " بثبات تام مهما تغيّر موضع الكرة." },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: "assessment-formative",
      label: "تكويني",
      screen: "assessment",
      mode: "formative",
      title: "تقييم تكويني",
      questions: [
        {
          id: "f1",
          kind: "mcq",
          prompt: "عند وصول الكرة إلى أعلى نقطة في مسار البندول، أي وصف صحيح للطاقة؟",
          options: [
            { id: 1, content: "طاقة الوضع عظمى والطاقة الحركية صفر" },
            { id: 2, content: "الطاقة الحركية عظمى وطاقة الوضع صفر" },
            { id: 3, content: "الطاقتان متساويتان في كل لحظة" },
          ],
          correctOptionId: 1,
          explanation:
            "عند أعلى نقطة تنعدم السرعة لحظياً، فتكون الطاقة الحركية صفراً وتتحوّل كل الطاقة إلى طاقة وضع عظمى.",
        },
        {
          id: "f2",
          kind: "true_false",
          prompt: "إذا تضاعفت كتلة الكرة، تتضاعف الطاقة الكلية للنظام.",
          options: TRUE_FALSE_OPTIONS,
          correctOptionId: 1,
          explanation:
            "الطاقة الكلية تتناسب طردياً مع الكتلة: Ep = mgh و Ek = ½mv². مضاعفة الكتلة تضاعف كل حد منهما.",
        },
        {
          id: "f3",
          kind: "mcq",
          prompt: "ما الذي يحدث للطاقة الكلية للبندول عند إهمال مقاومة الهواء؟",
          options: [
            { id: 1, content: "تزداد مع كل دورة" },
            { id: 2, content: "تبقى ثابتة" },
            { id: 3, content: "تنقص تدريجياً حتى تنعدم" },
          ],
          correctOptionId: 2,
          explanation:
            "في النظام المغلق بلا احتكاك تبقى الطاقة الميكانيكية الكلية ثابتة: Ep + Ek = Et.",
        },
      ],
    },
    {
      id: "assessment-final",
      label: "ختامي",
      screen: "assessment",
      mode: "final",
      title: "تقييم ختامي",
      questions: [
        {
          id: "s1",
          kind: "mcq",
          prompt: "أين تكون الطاقة الحركية للبندول أكبر ما يمكن؟",
          options: [
            { id: 1, content: "عند أعلى نقطة في المسار" },
            { id: 2, content: "عند أخفض نقطة في المسار" },
            { id: 3, content: "عند منتصف المسار دائماً" },
          ],
          correctOptionId: 2,
          explanation:
            "عند أخفض نقطة تكون طاقة الوضع صفراً، فتتحوّل كل الطاقة المتاحة إلى طاقة حركية.",
        },
        {
          id: "s2",
          kind: "true_false",
          prompt: "السرعة عند أخفض نقطة تعتمد على كتلة الكرة.",
          options: TRUE_FALSE_OPTIONS,
          correctOptionId: 0,
          explanation:
            "من حفظ الطاقة: ½mv² = mgh، فالكتلة تُختصر من الطرفين. السرعة تعتمد على فرق الارتفاع والجاذبية فقط.",
        },
        {
          id: "s3",
          kind: "mcq",
          prompt: "مع وجود مقاومة هواء بسيطة، إلى أين تذهب الطاقة التي يفقدها البندول تدريجياً؟",
          options: [
            { id: 1, content: "تختفي تماماً" },
            { id: 2, content: "تتحوّل إلى طاقة حرارية في الهواء والكرة" },
            { id: 3, content: "تتحوّل إلى طاقة وضع إضافية" },
          ],
          correctOptionId: 2,
          explanation:
            "مقاومة الهواء تحوّل جزءاً من الطاقة الميكانيكية إلى طاقة حرارية، لذلك تقل سعة الاهتزاز مع الزمن.",
        },
      ],
    },
    {
      id: "finish",
      label: "الختام",
      screen: "finish",
      title: "أتممت الدرس",
      message:
        "لخّصنا حفظ الطاقة عبر مختبر تفاعلي وتقييمين. أعد التجربة بكتلة أو طول مختلفين، ولاحظ أن Et لا يتغيّر ما دامت مقاومة الهواء مهملة.",
    },
  ],
};

/* ------------------------------ الحساب ------------------------------ */

export interface SandboxScore {
  correct: number;
  total: number;
  percent: number;
}

export function scoreAssessment(
  stage: SandboxAssessmentStage,
  answers: Record<string, number>,
): SandboxScore {
  const total = stage.questions.length;
  const correct = stage.questions.filter((question) => answers[question.id] === question.correctOptionId).length;
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) };
}

export function scoreLesson(
  lesson: SandboxLesson,
  answers: Record<string, number>,
): { byStage: Record<string, SandboxScore>; total: SandboxScore } {
  const byStage: Record<string, SandboxScore> = {};
  let correct = 0;
  let total = 0;

  for (const stage of lesson.stages) {
    if (stage.screen !== "assessment") continue;
    const score = scoreAssessment(stage, answers);
    byStage[stage.id] = score;
    correct += score.correct;
    total += score.total;
  }

  return {
    byStage,
    total: { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) },
  };
}


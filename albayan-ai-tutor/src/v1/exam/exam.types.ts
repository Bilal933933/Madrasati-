import { Type } from '@google/genai';
import type { Schema } from '@google/genai';

/**
 * الأنواع النصية التي يتولاها المساعد الذكي في التصحيح —
 * على عكس mcq/true_false التي تُصحَّح حتميًا في Laravel.
 */
export type AiQuestionType = 'short_answer' | 'essay' | 'numeric';

/** معيار واحد ضمن تقييم السؤال المقالي. */
export interface GradingCriteria {
  /** اسم المعيار (مثل: الدقة، الاكتمال، التنظيم). */
  criterion: string;
}

/** سياق المنهج المستخلص من Laravel — يُمرَّر نصًا لتقليل كلفة استدعاء RAG. */
export interface ExamContext {
  /** نص المنهج المستخلص (قد يتجاوز السؤال الواحد، يُشارك مع كل أسئلة الدفعة). */
  text?: string;
  lessonId?: number;
  subjectId?: number;
  gradeId?: number;
}

/** سؤال مرسل للتصحيح الذكي من Laravel (لقطة مجردة من النظرة الحتمية). */
export interface QuestionToGrade {
  questionId: number;
  type: AiQuestionType;
  question: string;
  /** نموذج الإجابة — يبقى في الحقل الفكر ويرسل للتصحيح فقط. */
  modelAnswer?: string;
  studentAnswer: string;
  /** إجابات بديلة مقبولة لسؤال قصير (اختيارية لتعزيز المقارنة الدلالية). */
  acceptedAnswers?: string[];
  /** عناصر التقييم للسؤال المقالي. */
  criteria?: EssayCriteriaInput[];
  /** القيمة العددية الصحيحة (لسؤال رقمي). */
  correctValue?: number;
  /** سماحية القبول (± فرق القيمة). */
  tolerance?: number;
  /** الوحدة (سم/كغم/...). */
  units?: string;
  /** سياق العترة — يغلب سياق الـ batch للتواج إن انLowerCase provided. */
  context?: string;
}

export interface EssayCriteriaInput {
  criterion: string;
  weight?: number;
}

/** حالة محاولة التصحيح لسؤال واحد. */
export type GradingAttemptStatus = 'graded' | 'error';

/**
 * نتيجة تصحيح سؤال واحد — الشكل الثابت الذي يعيده المساعد لـ Laravel.
 * - `score` (0-1) هو المقياس الموحد؛ تحديد الـ `correct` النهائي قرار تعليمي في Laravel.
 * - `aiGrade` يحمل تفاصيل نوع السؤال (feedback/درجة عناصر/تقبل بالتقريب...).
 * - عند تعذّر المساعد: `status = 'error'` و `score` = null → Laravel يوسم الـ question كـ pending_manual.
 */
export interface GradeResult {
  questionId: number;
  type: AiQuestionType;
  status: GradingAttemptStatus;
  score: number | null;
  aiGrade: Record<string, unknown> | null;
}

/* ------------------------------------------------------------------ */
/* مخططات JSON للمساعد (Structured Output) — مخطط صارم لكل نوع.        */
/* ------------------------------------------------------------------ */

/** مخطط سؤال قصير: حكم صحيح/خطأ + ثقة + تغذية راجعة. */
export const SHORT_ANSWER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    correct: { type: Type.BOOLEAN },
    confidence: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
  },
  required: ['correct', 'confidence', 'feedback'],
};

/** مخطط سؤال مقالي: درجة مئوية + تقييم عناصر + نقاط قوة وملاحظات تحسين. */
export const ESSAY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score_percent: { type: Type.NUMBER },
    criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          score: { type: Type.NUMBER },
          comment: { type: Type.STRING },
        },
        required: ['criterion', 'score', 'comment'],
      },
    },
    feedback: { type: Type.STRING },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    improvements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['score_percent', 'criteria', 'feedback', 'strengths', 'improvements'],
};

/** مخطط سؤال رقمي: صحيح + (مقبول بالتقريب) + درجة تقديرية + تغذية راجعة. */
export const NUMERIC_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    correct: { type: Type.BOOLEAN },
    accepted: { type: Type.BOOLEAN },
    score_hint: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
  },
  required: ['correct', 'accepted', 'score_hint', 'feedback'],
};
import { Injectable, Optional } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service.js';
import { RagService } from '../knowledge/rag.service.js';
import type { GradeExamDto } from './dto/grade-exam.dto.js';
import {
  ESSAY_SCHEMA,
  NUMERIC_SCHEMA,
  SHORT_ANSWER_SCHEMA,
  type ExamContext,
  type GradeResult,
  type QuestionToGrade,
} from './exam.types.js';

/** ناتج نموذج السؤال القصير (مطابق لـ SHORT_ANSWER_SCHEMA). */
interface ShortAnswerOutput {
  correct?: boolean;
  confidence?: number;
  feedback?: string;
}

/** ناتج نموذج السؤال المقالي (مطابق لـ ESSAY_SCHEMA). */
interface EssayOutput {
  score_percent?: number;
  criteria?: { criterion?: string; score?: number; comment?: string }[];
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

/** ناتج نموذج السؤال الرقمي (مطابق لـ NUMERIC_SCHEMA). */
interface NumericOutput {
  correct?: boolean;
  accepted?: boolean;
  score_hint?: number;
  feedback?: string;
}

const MAX_CONTEXT_CHARS = 12_000;
const RAG_FALLBACK = 'لم يصل سياق من المنصة، وقدّم تقييمك حسب نموذج الإجابة.';

/**
 * تصحيح الأنواع النصية (قصيرة/مقالية/رقمية) عبر Gemini Structured Output:
 * - مخطط JSON صارم لكل نوع يمنع النموذج من الانحراف عن البنية.
 * - المعالجة متوازية بالكامل؛ فشل أي سؤال لا يُسقط الباقي (allSettled).
 * - كل سؤال له مهلة زمنية؛ عند تجاوزها يُوسَّم السؤال بـ status='error'
 *   فيترك Laravel قرار وسومه pending_manual.
 * - السياق يُمرَّر نصًا من Laravel؛ إذا غاب يُجرَّب RAG كاحتياط (اختياري).
 */
@Injectable()
export class AiGradingService {
  private readonly timeoutMs: number;

  constructor(
    private readonly gemini: GeminiService,
    @Optional() private readonly rag?: RagService,
  ) {
    const parsed = Number.parseInt(process.env.AI_GRADING_TIMEOUT_MS ?? '', 10);
    this.timeoutMs =
      Number.isFinite(parsed) && parsed > 0 ? parsed : 30_000;
  }

  /**
   * تصحيح دفعة أسئلة بالتوازي — كل سؤال يُعالج بشكل مستقل تحت مهلة خاصة.
   * لا يفشل الطلب كليًّا إلا برفض DTO؛ فشل أي سؤال ينتج result بإشارة `error`.
   */
  async gradeMultiple(dto: GradeExamDto): Promise<GradeResult[]> {
    const results = new Array<GradeResult>(dto.questions.length);

    await Promise.all(
      dto.questions.map(async (q, index) => {
        results[index] = await this.withTimeout(
          this.gradeOne(q, dto.context),
          this.timeoutMs,
          `question=${q.questionId} graded in ${this.timeoutMs}ms`,
        );
      }),
    );

    return results;
  }

  /* ------------------------------------------------------------------ */

  private async gradeOne(
    q: QuestionToGrade,
    ctx?: ExamContext,
  ): Promise<GradeResult> {
    try {
      const context = await this.resolveContext(q, ctx);
      return await this.gradeByType(q, context);
    } catch {
      return {
        questionId: q.questionId,
        type: q.type,
        status: 'error',
        score: null,
        aiGrade: null,
      };
    }
  }

  /**
   * السياق: نص السؤال الخاص ← سياق الدفعة ← احتياط RAG إن توفر.
   * المُمرَّر يُقتطع لسقف آمن حتى لا يُضخَّم prompt السؤال.
   */
  private async resolveContext(
    q: QuestionToGrade,
    ctx?: ExamContext,
  ): Promise<string> {
    let text = '';

    if (q.context && q.context.trim()) {
      text = q.context.trim();
    } else if (ctx?.text && ctx.text.trim()) {
      text = ctx.text.trim();
    }

    if (text.length > 0) {
      return truncate(text, MAX_CONTEXT_CHARS);
    }

    if (!this.rag) return RAG_FALLBACK;

    try {
      const rag = await this.rag.retrieve(q.question, {
        subjectId: ctx?.subjectId ?? null,
        gradeId: ctx?.gradeId ?? null,
      });
      return truncate(rag.contentWindow || RAG_FALLBACK, MAX_CONTEXT_CHARS);
    } catch {
      return RAG_FALLBACK;
    }
  }

  private async gradeByType(
    q: QuestionToGrade,
    context: string,
  ): Promise<GradeResult> {
    switch (q.type) {
      case 'short_answer':
        return this.gradeShortAnswer(q, context);
      case 'essay':
        return this.gradeEssay(q, context);
      case 'numeric':
        return this.gradeNumeric(q, context);
    }
    throw new Error(`غير مدعوم نوع التصحيح: ${q.type}`);
  }

  /* ------------------------------ short_answer ----------------------------- */

  private async gradeShortAnswer(
    q: QuestionToGrade,
    context: string,
  ): Promise<GradeResult> {
    const system = [
      'أنت معلم عربي خبير يقيّم إجابة قصيرة (تعريف/كلمة/أكمل فراغًا) لطالب.',
      'اقبل الإجابة إذا عبرت عن نفس المعنى الصحيح الوارد في نموذج الإجابة،',
      'مع التسامح مع اختلاف الصياغة والأخطاء الإملائية اليسيرة.',
      'إذا وردت إجابات بديلة مقبولة فقارن بها أيضًا.',
      'الحالة الصحيحة/الخاطئة تستند إلى الفهم لا إلى التطابق الحرفي.',
      'feedback: سطر إلى سطرين بالعربية، يوجه الطالب بهدوء دون لوم.',
    ].join('\n');

    const userText = buildUserText(q, context, {
      label: 'إجابة الطالب',
      accepted: true,
    });

    const output = await this.gemini.generateStructured<ShortAnswerOutput>({
      system,
      userText,
      schema: SHORT_ANSWER_SCHEMA,
    });

    const correct = output.correct === true;
    const confidence = clampUnit(output.confidence ?? 0.5);
    const score = correct ? 1 : 0;

    return {
      questionId: q.questionId,
      type: 'short_answer',
      status: 'graded',
      score,
      aiGrade: {
        correct,
        confidence,
        feedback: output.feedback ?? 'تم تقييم إجابتك.',
      },
    };
  }

  /* --------------------------------- essay --------------------------------- */

  private async gradeEssay(
    q: QuestionToGrade,
    context: string,
  ): Promise<GradeResult> {
    const system = [
      'أنت معلم عربي خبير في تقييم الإجابات المقالية لطالب.',
      'قيّم حسب العناصر المذكورة وامنح درجة مئوية (0-100) للكل، ودرجة منفصلة لكل عنصر.',
      'كن عادلًا ومحفزًا؛ اذكر نقطتي قوة ونقطتي تحسين على الأقل.',
      'الرجبعة بلغة عربية فصيحة بسيطة مناسبة لمستوى الطالب.',
    ].join('\n');

    const userText = buildUserText(q, context, {
      label: 'إجابة الطالب (مقالية)',
      rubric: q.criteria && q.criteria.length ? q.criteria : defaultRubric(),
    });

    const output = await this.gemini.generateStructured<EssayOutput>({
      system,
      userText,
      schema: ESSAY_SCHEMA,
    });

    const scorePercent = clamp(output.score_percent ?? 0, 0, 100);
    const score = scorePercent / 100;

    return {
      questionId: q.questionId,
      type: 'essay',
      status: 'graded',
      score,
      aiGrade: {
        score_percent: Math.round(scorePercent * 100) / 100,
        criteria: (output.criteria ?? []).map((c) => ({
          criterion: c.criterion ?? '',
          score: clamp(c.score ?? 0, 0, 100),
          comment: c.comment ?? '',
        })),
        feedback: output.feedback ?? 'تم تقييم إجابتك.',
        strengths: output.strengths ?? [],
        improvements: output.improvements ?? [],
      },
    };
  }

  /* -------------------------------- numeric -------------------------------- */

  private async gradeNumeric(
    q: QuestionToGrade,
    context: string,
  ): Promise<GradeResult> {
    const system = [
      'أنت معلم علوم/رياضيات يقيّم إجابة رقمية لطالب.',
      'السؤال يحمل قيمة صحيحة وسماحية (±) ووحدة. احكم:',
      '- correct: القيمة الرقمية ضمن السماحية بالوحدة الصحيحة.',
      '- accepted: القيمة تقريبية مقبولة بالرغم من عدم مطابقة السماحية تمامًا (تقريب، وحدات معكوسة).',
      '- score_hint: درجة تقديرية بين 0 و 1.',
      'ثم قدم تعليقًا قصيرًا بالعربية.',
    ].join('\n');

    const userText = buildUserText(q, context, {
      label: 'إجابة الطالب (رقمية)',
    });

    const output = await this.gemini.generateStructured<NumericOutput>({
      system,
      userText,
      schema: NUMERIC_SCHEMA,
    });

    const correct = output.correct === true;
    const accepted = output.accepted === true;
    const score = correct ? 1 : accepted ? 0.5 : 0;

    return {
      questionId: q.questionId,
      type: 'numeric',
      status: 'graded',
      score,
      aiGrade: {
        correct,
        accepted,
        score_hint: clampUnit(output.score_hint ?? score),
        feedback: output.feedback ?? 'تم تقييم إجابتك.',
      },
    };
  }

  /* -------------------------------- helpers -------------------------------- */

  private withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`ai grading timeout: ${label}`)),
        ms,
      );
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      );
    });
  }
}

/* ------------------------------------------------------------------ */
/* أدوات نقية (قابلة للاختبار)                                          */
/* ------------------------------------------------------------------ */

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampUnit(value: number): number {
  return clamp(value, 0, 1);
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function defaultRubric(): { criterion: string }[] {
  return [
    { criterion: 'الدقة العلمية' },
    { criterion: 'الاكتمال واتباع مفردات السؤال' },
    { criterion: 'التنظيم والوضوح' },
  ];
}

/**
 * بناء نص المستخدم الموحّد لأنواع الأسئلة — السؤال + النموذج + إجابة الطالب
 * + بيانات النوع (قيّد الميدثا فقط في النوع الذي يحتاجها).
 */
export function buildUserText(
  q: QuestionToGrade,
  context: string,
  opts: {
    label: string;
    accepted?: boolean;
    rubric?: { criterion: string }[];
  },
): string {
  const lines: (string | null)[] = [
    `السؤال: ${q.question}`,
    q.modelAnswer ? `نموذج الإجابة: ${q.modelAnswer}` : null,
    opts.accepted && q.acceptedAnswers?.length
      ? `إجابات بديلة مقبولة: ${q.acceptedAnswers.join('؛ ')}`
      : null,
    q.type === 'numeric'
      ? numericSpecLine(q)
      : null,
    opts.rubric?.length
      ? `معايير التقييم:\n- ${opts.rubric.map((c) => c.criterion).join('\n- ')}`
      : null,
    context && context !== RAG_FALLBACK
      ? `السياق المنهجي:\n${context}`
      : null,
    `${opts.label ?? 'إجابة الطالب'}: ${q.studentAnswer}`,
  ];

  return lines.filter((line): line is string => line !== null).join('\n\n');
}

function numericSpecLine(q: QuestionToGrade): string | null {
  const parts: string[] = [];
  if (q.correctValue !== undefined) parts.push(`القيمة الصحيحة: ${q.correctValue}`);
  if (q.tolerance !== undefined) parts.push(`السماحية: ±${q.tolerance}`);
  if (q.units) parts.push(`الوحدة: ${q.units}`);
  return parts.length ? parts.join(' | ') : null;
}
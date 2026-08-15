import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { splitMarkdown, type Chunk } from './chunker.js';
import {
  BookSection,
  GeneralBookDoc,
  MarkdownDoc,
  MarkdownLoader,
} from './markdown-loader.js';
import { extractTipTapText } from './tiptap.js';
import { LoggerService } from '../common/logger/logger.service.js';

export interface RagResult {
  lessons: { id: number; title: string; summary: string | null }[];
  contentWindow: string;
  sources: { lessonId: number; lessonTitle: string }[];
}

@Injectable()
export class RagService {
  private readonly maxChars: number;
  private readonly coverageThreshold: number;
  private readonly minContentChars: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly markdown: MarkdownLoader,
    @Optional() private readonly logger?: LoggerService,
  ) {
    const parsed = Number.parseInt(process.env.AI_RAG_MAX_CHARS ?? '', 10);
    this.maxChars = Number.isFinite(parsed) && parsed > 0 ? parsed : 120000;

    const coverage = Number.parseFloat(
      process.env.RAG_SUFFICIENCY_COVERAGE ?? '',
    );
    this.coverageThreshold =
      Number.isFinite(coverage) && coverage > 0 && coverage <= 1
        ? coverage
        : 0.6;

    const contentChars = Number.parseInt(
      process.env.RAG_MIN_CONTENT_CHARS ?? '',
      10,
    );
    this.minContentChars =
      Number.isFinite(contentChars) && contentChars > 0 ? contentChars : 120;
  }

  /**
   * استرجاع نصي بسيط (بلا vector DB) ببنية متدرجة:
   * 1) الطبقة 1: الدروس المطابقة من المنصة (استعلام DB).
   * 2) الطبقة 2: مقاطع الكتاب المدرسي/المراجع المطابقة (في الذاكرة) — تعمل
   *    بالتوازي مع الطبقة 1 عبر Promise.allSettled لأنها رخيصة.
   * 3) الطبقة 3: أقسام المراجع العامة (قراءات قرص) — كسولة تسلسلية، لا تُبنى
   *    إلا عند عدم كفاية الطبقتين 1 و2 لبوابة الكفاية.
   * بوابة الكفاية: تغطية نسبة التوكنز الجوهرية للسؤال ≥ العتبة
   * (RAG_SUFFICIENCY_COVERAGE، افتراضي 0.6) وسور الطول الثانوي
   * (RAG_MIN_CONTENT_CHARS، افتراضي 120). الكسب الهامشي بين الطبقات: لا يُضم
   * مقطع/قسم يعيد توكنز جوهرية نُصِّفت بالفعل في النافذة الحالية.
   */
  async retrieve(
    question: string,
    opts: { subjectId?: number | null; gradeId?: number | null },
  ): Promise<RagResult> {
    const tokens = this.tokenize(question);
    if (tokens.length === 0) {
      return { lessons: [], contentWindow: '', sources: [] };
    }

    // الأوزان IDF تُحسب مرة واحدة وتُشارك بين الطبقتين 2 و3 لاتساق الصلة.
    const tokenWeights = this.computeTokenWeights(
      this.markdown.matchingGeneral({
        subjectId: opts.subjectId,
        gradeId: opts.gradeId,
      }),
      tokens,
    );

    const layerErrors: unknown[] = [];

    // الطبقة 1 (DB) والطبقة 2 (ذاكرة) — تدهور سعيد: فشل DB للدروس لا يفشل
    // الطلب، بل يُكمَل من مقاطع المدرسي والمراجع.
    const [layer1, layer2] = await Promise.allSettled([
      this.buildLayer1(opts, tokens),
      Promise.resolve(this.buildLayer2Candidates(opts, tokens, tokenWeights)),
    ]);

    let lessons: RagResult['lessons'] = [];
    let block1 = '';
    if (layer1.status === 'fulfilled') {
      lessons = layer1.value.lessons;
      block1 = layer1.value.block;
    } else {
      layerErrors.push(layer1.reason);
      this.logger?.warn(
        { event: 'rag.layer1_failed' },
        'فشل بناء الطبقة 1 (دروس DB) — تُكمَّل من مكوّنات الطبقات التالية',
        {
          subjectId: opts.subjectId,
          gradeId: opts.gradeId,
          question: question.slice(0, 120),
        },
      );
    }

    const layers: string[] = [];
    if (block1) layers.push(block1);

    let block2 = '';
    if (layer2.status === 'fulfilled') {
      block2 = this.selectLayer2(layer2.value, tokens, block1);
      if (block2) layers.push(block2);
    } else {
      layerErrors.push(layer2.reason);
      this.logger?.warn(
        { event: 'rag.layer2_failed' },
        'فشل بناء الطبقة 2 (مقاطع المدرسي/المراجع)',
        { subjectId: opts.subjectId, gradeId: opts.gradeId },
      );
    }

    let contentWindow = layers.join('\n\n');

    // الطبقة 3 كسولة: تُقرأ من القرص فقط عند عدم كفاية الطبقتين 1 و2 معًا.
    if (!this.isLayerSufficient(contentWindow, tokens)) {
      try {
        const block3 = this.buildLayer3(
          opts,
          tokens,
          tokenWeights,
          contentWindow,
        );
        if (block3) {
          layers.push(block3);
          contentWindow = layers.join('\n\n');
        }
      } catch (err) {
        layerErrors.push(err);
        this.logger?.warn(
          { event: 'rag.layer3_failed' },
          'فشل بناء الطبقة 3 (المراجع العامة)',
          { subjectId: opts.subjectId, gradeId: opts.gradeId },
        );
      }
    }

    // حماية قصوى بلا قصّ وسط المعرفة: تُسقط طبقات كاملة من النهاية عند
    // تجاوز السقف، فلا يُقطع قسم في منتصفه إلا في الحالة النظرية الوحيدة
    // التي تتفوق فيها الطبقة 1 وحدها على السقف.
    while (contentWindow.length > this.maxChars && layers.length > 1) {
      layers.pop();
      contentWindow = layers.join('\n\n');
    }
    if (contentWindow.length > this.maxChars) {
      contentWindow = contentWindow.slice(0, this.maxChars);
    }

    // لا مصدر دون نص فعلي داخل النافذة: نتأكد أن ترويسة الدرس وصلت فعلًا،
    // حتى بعد أسقاط الطبقات أو القص النظري في الطبقة 1.
    const sources = (
      layer1.status === 'fulfilled' ? layer1.value.sources : []
    ).filter((s) => contentWindow.includes(`### ${s.lessonTitle}`));

    // فشل الطبقات جميعها فقط يفشل الطلب.
    if (contentWindow.trim().length === 0 && layerErrors.length > 0) {
      const message =
        layerErrors[0] instanceof Error
          ? layerErrors[0].message
          : String(layerErrors[0]);
      throw new Error(`لم تُبنَ أي طبقة سياق: ${message}`);
    }

    return { lessons, contentWindow, sources };
  }

  /**
   * الطبقة 1: دروس منصة من DB تُقيَّم بالسؤال ثم تُسحب فقراتها كنصوص.
   * المصدر يُسجَّل للدرس فقط إن وُجد نصه الفعلي ضمن النافذة (لا استشهاد
   * بلا نص) — إغلاق التسريب الذي كان يدفع كل الدروس المختارة مهما كانت
   * فقراتها فارغة.
   */
  private async buildLayer1(
    opts: {
      subjectId?: number | null;
      gradeId?: number | null;
    },
    tokens: string[],
  ): Promise<{
    block: string;
    lessons: RagResult['lessons'];
    sources: RagResult['sources'];
  }> {
    const lessons = await this.prisma.lessons.findMany({
      where: {
        is_published: true,
        ...(opts.subjectId != null
          ? { courses: { subject_id: opts.subjectId } }
          : opts.gradeId != null
            ? { courses: { subjects: { grade_id: opts.gradeId } } }
            : {}),
      },
      select: {
        id: true,
        title: true,
        summary: true,
        learning_objectives: true,
      },
      take: 200,
      orderBy: { sort_order: 'asc' },
    });

    const scored = lessons
      .map((lesson) => ({
        lesson,
        score: this.scoreLesson(lesson, tokens),
      }))
      .sort((a, b) => b.score - a.score);

    // استبعاد الدروس عديمة الصلة تمامًا (score=0) حتى لا تُزحم النافذة.
    const selected = scored.filter((s) => s.score > 0).slice(0, 4);

    const paragraphs = await this.prisma.paragraphs.findMany({
      where: {
        lesson_id: { in: selected.map((s) => s.lesson.id) },
      },
      select: { id: true, lesson_id: true, title: true, content: true },
    });

    const byLesson = new Map<number, string[]>();
    for (const p of paragraphs) {
      const extracted = extractTipTapText(p.content);
      if (!extracted.ok) {
        this.logger?.warn(
          { event: 'rag.paragraph_extract_failed' },
          'فشل استخراج نص فقرة من JSON تيبتاب',
          {
            lessonId: Number(p.lesson_id),
            paragraphId: Number(p.id),
            paragraphTitle: p.title,
            contentPreview: p.content.slice(0, 120),
          },
        );
        continue;
      }
      if (extracted.text.length === 0) {
        continue;
      }
      const list = byLesson.get(Number(p.lesson_id)) ?? [];
      list.push(extracted.text);
      byLesson.set(Number(p.lesson_id), list);
    }

    const lessonsBlock: string[] = [];
    const sources: RagResult['sources'] = [];
    for (const entry of selected) {
      const texts = byLesson.get(Number(entry.lesson.id)) ?? [];
      if (texts.length === 0) continue;
      lessonsBlock.push(`### ${entry.lesson.title}\n${texts.join('\n\n')}`);
      sources.push({
        lessonId: Number(entry.lesson.id),
        lessonTitle: entry.lesson.title,
      });
    }

    const block =
      lessonsBlock.length > 0
        ? `## الطبقة 1: الدرس على المنصة\n${lessonsBlock.join('\n\n')}`
        : '';

    return {
      block,
      lessons: selected.map((s) => ({
        id: Number(s.lesson.id),
        title: s.lesson.title,
        summary: s.lesson.summary,
      })),
      sources,
    };
  }

  /** يجمع مرشّحين الطبقة 2 (مقاطع chunked) — يصلح للبناء المتوازي. */
  private buildLayer2Candidates(
    opts: { subjectId?: number | null; gradeId?: number | null },
    tokens: string[],
    tokenWeights: Map<string, number>,
  ): { doc: MarkdownDoc; chunk: Chunk; score: number }[] {
    const chunkCandidates: {
      doc: MarkdownDoc;
      chunk: Chunk;
      score: number;
    }[] = [];
    for (const doc of this.markdown.matching({
      subjectId: opts.subjectId,
      gradeId: opts.gradeId,
    })) {
      for (const chunk of splitMarkdown(doc.body)) {
        const { score, contentMatch } = scoreChunk(chunk, tokens, tokenWeights);
        if (score > 0 && contentMatch) {
          chunkCandidates.push({ doc, chunk, score });
        }
      }
    }
    return chunkCandidates.sort((a, b) => b.score - a.score);
  }

  /**
   * يختار مقاطع الطبقة 2 ضمن ميزانية الحروف المتبقية بعد الطبقة 1، مع
   * الكسب الهامشي: يُضم مقطع فقط لو أضاف توكنز جوهرية للسؤال غير ممثلة بعد
   * في نافذة الطبقة 1 (مثل ملف مرجعي يكرّر نص درس المنصة).
   */
  private selectLayer2(
    candidates: { doc: MarkdownDoc; chunk: Chunk; score: number }[],
    tokens: string[],
    block1: string,
  ): string {
    const represented = this.coveredSubstantiveTokens(tokens, block1);
    const budget = Math.max(0, this.maxChars - block1.length);

    const markdownBlock: string[] = [];
    let used = 0;
    for (const cand of candidates) {
      const addedTokens = this.addedSubstantiveTokens(
        tokens,
        `${cand.chunk.heading} ${cand.chunk.text}`,
        represented,
      );
      if (addedTokens.length === 0) continue;
      const label =
        cand.doc.type === 'reference' ? 'مرجع عام' : 'من الكتاب المدرسي';
      const heading = cand.chunk.heading.trim();
      const block = `### ${cand.doc.title} — [${label}]${heading ? ` — ${heading}` : ''}\n${cand.chunk.text}`;
      // يقرأ أول مقطع مهما كان حجمه، ثم يتوقف عند تجاوز الميزانية بمقاطع كاملة.
      if (markdownBlock.length > 0 && used + block.length > budget) break;
      markdownBlock.push(block);
      used += block.length;
    }

    if (markdownBlock.length === 0) return '';
    return `## الطبقة 2: من الكتاب المدرسي والمراجع\n${markdownBlock.join('\n\n')}`;
  }

  /**
   * الطبقة 3: أقسام المراجع العامة — تُقرأ كسولةً من القرص فقط عند عدم كفاية
   * الطبقتين 1 و2 لبوابة الكفاية، وضمن ميزانية الحروف المتبقية. الكسب
   * الهامشي ينطبق أيضًا: قسمٌ يعيد توكنز جوهرية نُصِّفت لا يُقرأ.
   */
  private buildLayer3(
    opts: { subjectId?: number | null; gradeId?: number | null },
    tokens: string[],
    tokenWeights: Map<string, number>,
    windowBefore: string,
  ): string {
    const candidates: {
      section: BookSection;
      book: GeneralBookDoc;
      score: number;
    }[] = [];
    for (const book of this.markdown.matchingGeneral({
      subjectId: opts.subjectId,
      gradeId: opts.gradeId,
    })) {
      for (const cand of this.candidateSections(book, tokens, tokenWeights)) {
        candidates.push({ ...cand, book });
      }
    }
    candidates.sort((a, b) => b.score - a.score);

    const represented = this.coveredSubstantiveTokens(tokens, windowBefore);
    const budget = Math.max(0, this.maxChars - windowBefore.length);

    const generalBlock: string[] = [];
    let used = 0;
    for (const cand of candidates) {
      const text = this.markdown.readSection(cand.book, cand.section);
      if (!text) continue;
      const addedTokens = this.addedSubstantiveTokens(
        tokens,
        `${cand.section.title} ${(cand.section.concepts ?? []).join(' ')} ${text}`,
        represented,
      );
      if (addedTokens.length === 0) continue;
      const block = `### ${cand.section.title} — [${cand.book.title}: ${cand.section.page}]\n${text}`;
      // يقرأ أول قسم مهما كان حجمه، ثم يتوقف عند تجاوز الميزانية بأقسام كاملة.
      if (generalBlock.length > 0 && used + block.length > budget) break;
      generalBlock.push(block);
      used += block.length;
    }

    if (generalBlock.length === 0) return '';
    return `## الطبقة 3: من المراجع العامة\n${generalBlock.join('\n\n')}`;
  }

  /**
   * بوابة الكفاية: هل توفر النافذة الحالية مواد كافية للإجابة؟
   * 1) شرط صلة صريح: مفردة جوهرية واحدة على الأقل داخل النافذة.
   * 2) نسبة التغطية (المغطاة من التوكنز الجوهرية للسؤال) ≥ العتبة.
   * 3) سور طول ثانوي حتى لا تقدّ نافذة قصيرة تكرارية بأنها "كافية".
   * يحصر النسبةَ على التوكنز الجوهرية فقط (يستبعد MINOR_TOKENS مثل الفرق/بين)
   * حتى لا يبدو سؤال "الفرق بين..." كافيًا بتغطية لا جوهر تجاهها.
   */
  private isLayerSufficient(contentWindow: string, tokens: string[]): boolean {
    const substantive = tokens.filter((t) => !MINOR_TOKENS.has(t));
    if (substantive.length === 0) return false;
    if (contentWindow.length < this.minContentChars) return false;

    let covered = 0;
    for (const token of substantive) {
      if (textMatchesToken(contentWindow, token)) covered += 1;
    }
    if (covered === 0) return false;
    return covered / substantive.length >= this.coverageThreshold;
  }

  /** التوكنز الجوهرية للسؤال الممثلة فعلًا في نص معيّن. */
  private coveredSubstantiveTokens(
    tokens: string[],
    text: string,
  ): Set<string> {
    const covered = new Set<string>();
    for (const token of tokens) {
      if (MINOR_TOKENS.has(token)) continue;
      if (text.length > 0 && textMatchesToken(text, token)) covered.add(token);
    }
    return covered;
  }

  /** التوكنز الجوهرية الإضافية التي يحققها نص مرشّح ولا تتوفر بعد في النافذة. */
  private addedSubstantiveTokens(
    tokens: string[],
    text: string,
    represented: Set<string>,
  ): string[] {
    const added: string[] = [];
    for (const token of tokens) {
      if (MINOR_TOKENS.has(token)) continue;
      if (represented.has(token)) continue;
      if (text.length > 0 && textMatchesToken(text, token)) added.push(token);
    }
    return added;
  }

  private tokenize(text: string): string[] {
    return normalizeArabic(text)
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  }

  /**
   * يزن التوكنز عكسيًا مع تواترها في كتالوج الأقسام كافة (idf):
   * المفردة النادرة (المبتدأ) تُرجَّح فوق الكلمة العامة المتكررة (الفرق، بين)
   * فيعلو القسم المطابق للموضوع الحقيقي على المقارنات العامة.
   * الصيغة (total+1)/(df+1) تضمن وزنًا موجبًا حتى في الكتالوجات الصغيرة.
   */
  private computeTokenWeights(
    books: GeneralBookDoc[],
    tokens: string[],
  ): Map<string, number> {
    const sections: string[] = [];
    for (const book of books) {
      for (const part of book.parts) {
        for (const section of part.sections) {
          if (section.kind !== 'content') continue;
          sections.push(
            `${section.title} ${(section.concepts ?? []).join(' ')}`,
          );
        }
      }
    }
    const total = Math.max(sections.length, 1);
    const weights = new Map<string, number>();
    for (const token of tokens) {
      let df = 0;
      for (const text of sections) {
        if (textMatchesToken(text, token)) df += 1;
      }
      // حد أدنى للوزن (0.5) حتى لا ينعدم وزن المفردة الشائعة في كتالوج صغير
      // يكون فيه df قريبًا من total، فلا يُسقط قسمٌ صحيح لمجرد شيوع لفظة فيه.
      weights.set(token, Math.max(0.5, Math.log((total + 1) / (df + 1))));
    }
    return weights;
  }

  /**
   * يرصد كل أقسام الكتاب المجتازة لبوابة الصلة: تطابق توكنز السؤال مع
   * العنوان أو المفاهيم، مع إمّا مفردة جوهرية على الأقل (contentMatch).
   * تُرجع المرشّحين بنتائجهم مرتّبة تنازليًا لتُرَتَّب على مستوى الكتب كافة
   * وتُقتطع حسب الميزانية في retrieve.
   */
  private candidateSections(
    book: GeneralBookDoc,
    tokens: string[],
    weights: Map<string, number>,
  ): { section: BookSection; score: number }[] {
    if (tokens.length === 0) return [];

    const scored: { section: BookSection; score: number }[] = [];
    for (const part of book.parts) {
      for (const section of part.sections) {
        if (section.kind !== 'content') continue;
        const title = normalizeArabic(section.title).toLowerCase();
        const concepts = normalizeArabic(
          (section.concepts ?? []).join(' '),
        ).toLowerCase();

        let score = 0;
        let contentMatch = false;
        for (const token of tokens) {
          const tMatch = textMatchesToken(title, token);
          const cMatch = textMatchesToken(concepts, token);
          if (!tMatch && !cMatch) continue;
          if (!MINOR_TOKENS.has(token)) contentMatch = true;
          const w = MINOR_TOKENS.has(token) ? 0.5 : (weights.get(token) ?? 1);
          if (tMatch) score += 3 * w;
          if (cMatch) score += 2 * w;
        }
        // الأقسام التي لا تطابق أي مفردة جوهرية (مثل "الفرق بين...") خارج السباق.
        if (score > 0 && contentMatch) scored.push({ section, score });
      }
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  private scoreLesson(
    lesson: {
      title: string;
      summary: string | null;
      learning_objectives: unknown;
    },
    tokens: string[],
  ): number {
    const title = lesson.title.toLowerCase();
    const summary = (lesson.summary ?? '').toLowerCase();
    const objectives = Array.isArray(lesson.learning_objectives)
      ? lesson.learning_objectives.join(' ').toLowerCase()
      : '';

    let score = 0;
    for (const token of tokens) {
      if (textMatchesToken(title, token)) score += 3;
      if (textMatchesToken(summary, token)) score += 2;
      if (textMatchesToken(objectives, token)) score += 1;
    }
    return score;
  }
}

/**
 * يقيّم مقطعًا من الطبقة 2 (نص ملف مدرسي/مرجع) بنفس أوزان الطبقة 3:
 * تطابق العنوان أعلى (3w) من تطابق النص (2w)، مع وزن الندرة IDF.
 * يُرفض المقطع إن لم يطابق أي مفردة جوهرية (contentMatch) — فلا تدخل
 * الملفات غير ذات الصلة نافذة السياق.
 */
export function scoreChunk(
  chunk: Chunk,
  tokens: string[],
  weights: Map<string, number>,
): { score: number; contentMatch: boolean } {
  if (tokens.length === 0) return { score: 0, contentMatch: false };

  const heading = normalizeArabic(chunk.heading).toLowerCase();
  const text = normalizeArabic(chunk.text).toLowerCase();

  let score = 0;
  let contentMatch = false;
  for (const token of tokens) {
    const tMatch = textMatchesToken(heading, token);
    const cMatch = textMatchesToken(text, token);
    if (!tMatch && !cMatch) continue;
    if (!MINOR_TOKENS.has(token)) contentMatch = true;
    const w = MINOR_TOKENS.has(token) ? 0.5 : (weights.get(token) ?? 1);
    if (tMatch) score += 3 * w;
    if (cMatch) score += 2 * w;
  }

  return { score: score > 0 && contentMatch ? score : 0, contentMatch };
}

/**
 * يطبّع النص العربي للمطابقة: يجرّد التشكيل وعلامات الإعراب والتطويل
 * ويوحّد الألف المقصورة والتاء المربوطة والهمزات. ضروري لأن عناوين
 * الفهارس مشكولة بينما أسئلة الطالب غير مشكولة عادة.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0623\u0622\u0625]/g, '\u0627');
}

/** كلمات استفهام/ربط عامة تُستبعد من التوكنز حتى لا تلوّث المطابقة. */
const STOPWORDS = new Set([
  'ما',
  'ماذا',
  'ماهو',
  'ماهي',
  'لماذا',
  'كيف',
  'هل',
  'متي',
  'اين',
  'هو',
  'هي',
  'هذا',
  'هذه',
  'ذلك',
  'تلك',
  'ان',
  'ثم',
  'قد',
  'انت',
  'نحن',
]);

/**
 * توكنز مقارنة عامة شائعة في العناوين (الفرق بين...) — تُمنح وزنًا منخفضًا
 * ولا ينهض قسمٌ بها وحدها ليُقرأ.
 */
const MINOR_TOKENS = new Set(['الفرق', 'بين']);

/**
 * يوسّع الكلمة إلى أشكالها الاحتمالية بعد تطبيعها: يجرّد حروف الجر/العطف
 * المفردة (و ف ب ك ل) وأداة التعريف (ال) المتكررة على شكل و/ف/ب/ك/ل + ال.
 * مثال: «والخبر» ← { والخبر, الخبر, خبر }.
 */
function expandWord(word: string): Set<string> {
  const out = new Set<string>();
  if (!word) return out;
  out.add(word);
  let w = word;
  while (w.length > 2 && 'وفبكل'.includes(w[0])) {
    w = w.slice(1);
    out.add(w);
  }
  if (w.startsWith('ال') && w.length - 2 >= 3) {
    out.add(w.slice(2));
  }
  return out;
}

/**
 * يتحقق من أن التوكن يطابق كلمة كاملة في النص مع مراعاة البادئات —
 * لا مطابقة جزئية: «بين» لا تطابق «بينما»، و«والخبر» تطابق «الخبر».
 */
function textMatchesToken(text: string, token: string): boolean {
  const tokenCands = expandWord(normalizeArabic(token).toLowerCase());
  const words = normalizeArabic(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  for (const w of words) {
    for (const c of expandWord(w)) {
      if (tokenCands.has(c)) return true;
    }
  }
  return false;
}

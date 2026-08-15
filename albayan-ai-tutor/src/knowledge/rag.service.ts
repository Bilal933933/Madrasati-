import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { splitMarkdown, type Chunk } from './chunker.js';
import {
  BookSection,
  GeneralBookDoc,
  MarkdownDoc,
  MarkdownLoader,
} from './markdown-loader.js';

export interface RagResult {
  lessons: { id: number; title: string; summary: string | null }[];
  contentWindow: string;
  sources: { lessonId: number; lessonTitle: string }[];
}

@Injectable()
export class RagService {
  private readonly maxChars: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly markdown: MarkdownLoader,
  ) {
    const parsed = Number.parseInt(process.env.AI_RAG_MAX_CHARS ?? '', 10);
    this.maxChars = Number.isFinite(parsed) && parsed > 0 ? parsed : 120000;
  }

  /**
   * استرجاع نصي بسيط (بلا vector DB):
   * 1) يجلب دروس المادة/الصف الحالي.
   * 2) يقيّم كل درس بتطابق توكنات السؤال مع العنوان/الملخص/الأهداف.
   * 3) يختار الأعلى تطابقًا ويسحب فقراته نصوصًا → نافذة سياق.
   */
  async retrieve(
    question: string,
    opts: { subjectId?: number | null; gradeId?: number | null },
  ): Promise<RagResult> {
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

    const tokens = this.tokenize(question);
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
      select: { lesson_id: true, title: true, content: true },
    });

    const byLesson = new Map<number, string[]>();
    for (const p of paragraphs) {
      const list = byLesson.get(Number(p.lesson_id)) ?? [];
      list.push(p.content);
      byLesson.set(Number(p.lesson_id), list);
    }

    const lessonsBlock: string[] = [];
    const sources: RagResult['sources'] = [];
    for (const entry of selected) {
      const texts = byLesson.get(Number(entry.lesson.id)) ?? [];
      if (texts.length > 0) {
        lessonsBlock.push(`### ${entry.lesson.title}\n${texts.join('\n\n')}`);
      }
      sources.push({
        lessonId: Number(entry.lesson.id),
        lessonTitle: entry.lesson.title,
      });
    }

    const layers: string[] = [];

    // الطبقة 1: الدروس المطابقة من المنصة.
    if (lessonsBlock.length > 0) {
      layers.push(
        `## الطبقة 1: الدرس على المنصة\n${lessonsBlock.join('\n\n')}`,
      );
    }

    const layersLength = (ls: string[]): number =>
      ls.reduce((sum, l) => sum + l.length + 2, 0);

    // الأوزان IDF تُحسب مرة واحدة وتُشارك بين الطبقتين 2 و3 لاتساق الصلة.
    const generalBooks = this.markdown.matchingGeneral({
      subjectId: opts.subjectId,
      gradeId: opts.gradeId,
    });
    const tokenWeights = this.computeTokenWeights(generalBooks, tokens);

    // الطبقة 2: ملفات المعرفة Markdown (الكتاب المدرسي والمراجع).
    // تُقطَّع نصوصها عبر chunker ثم تُقيَّم بنفس أوزان الطبقة 3 بدل ضخ كامل
    // الملف — فلا تدخل الملفات غير المطابقة، ويُختار أنسب المقاطع فقط.
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
    chunkCandidates.sort((a, b) => b.score - a.score);

    const budget2 = Math.max(0, this.maxChars - layersLength(layers));
    const markdownBlock: string[] = [];
    let used2 = 0;
    for (const cand of chunkCandidates) {
      const label =
        cand.doc.type === 'reference' ? 'مرجع عام' : 'من الكتاب المدرسي';
      const heading = cand.chunk.heading.trim();
      const block = `### ${cand.doc.title} — [${label}]${heading ? ` — ${heading}` : ''}\n${cand.chunk.text}`;
      // يقرأ أول مقطع مهما كان حجمه، ثم يتوقف عند تجاوز الميزانية بمقاطع كاملة.
      if (markdownBlock.length > 0 && used2 + block.length > budget2) break;
      markdownBlock.push(block);
      used2 += block.length;
    }
    if (markdownBlock.length > 0) {
      layers.push(
        `## الطبقة 2: من الكتاب المدرسي والمراجع\n${markdownBlock.join('\n\n')}`,
      );
    }

    // الطبقة 3: الكتب العامة المفهرسة — قراءة كل الأقسام المطابقة للسؤال،
    // مرتّبة بالنتيجة (الأعلى صلة أولًا) وضمن ميزانية الحروف المتبقية بعد
    // الطبقتين 1 و2. بذلك تُقرأ كل التفاصيل ذات الصلة (أنواع، أشكال، حالات)
    // ولو توزّعت على أقسام كثيرة أو مصادر متعددة، بأقسام كاملة لا قصّ وسطها.
    const candidates: {
      section: BookSection;
      book: GeneralBookDoc;
      score: number;
    }[] = [];
    for (const book of generalBooks) {
      for (const cand of this.candidateSections(book, tokens, tokenWeights)) {
        candidates.push({ ...cand, book });
      }
    }
    candidates.sort((a, b) => b.score - a.score);

    const budget = Math.max(0, this.maxChars - layersLength(layers));

    const generalBlock: string[] = [];
    let used = 0;
    for (const cand of candidates) {
      const text = this.markdown.readSection(cand.book, cand.section);
      if (!text) continue;
      const block = `### ${cand.section.title} — [${cand.book.title}: ${cand.section.page}]\n${text}`;
      // يقرأ أول قسم مهما كان حجمه، ثم يتوقف عند تجاوز الميزانية بأقسام كاملة.
      if (generalBlock.length > 0 && used + block.length > budget) break;
      generalBlock.push(block);
      used += block.length;
    }
    if (generalBlock.length > 0) {
      layers.push(
        `## الطبقة 3: من المراجع العامة\n${generalBlock.join('\n\n')}`,
      );
    }

    // حماية قصوى بلا قصّ وسط المعرفة: تُسقط طبقات كاملة من النهاية عند
    // تجاوز السقف، فلا يُقطع قسم في منتصفه إلا في الحالة النظرية الوحيدة
    // التي تتفوق فيها الطبقة 1 وحدها على السقف.
    let contentWindow = layers.join('\n\n');
    while (contentWindow.length > this.maxChars && layers.length > 1) {
      layers.pop();
      contentWindow = layers.join('\n\n');
    }
    if (contentWindow.length > this.maxChars) {
      contentWindow = contentWindow.slice(0, this.maxChars);
    }

    return {
      lessons: selected.map((s) => ({
        id: Number(s.lesson.id),
        title: s.lesson.title,
        summary: s.lesson.summary,
      })),
      contentWindow: contentWindow,
      sources,
    };
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

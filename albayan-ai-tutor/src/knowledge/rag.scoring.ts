import type { Chunk } from './chunker.js';
import type { BookSection, GeneralBookDoc } from './markdown-loader.js';
import {
  MINOR_TOKENS,
  normalizeArabic,
  textMatchesToken,
} from './rag.tokenizer.js';

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
 * يزن التوكنز عكسيًا مع تواترها في كتالوج الأقسام كافة (idf):
 * المفردة النادرة (المبتدأ) تُرجَّح فوق الكلمة العامة المتكررة (الفرق، بين)
 * فيعلو القسم المطابق للموضوع الحقيقي على المقارنات العامة.
 * الصيغة (total+1)/(df+1) تضمن وزنًا موجبًا حتى في الكتالوجات الصغيرة.
 */
export function computeTokenWeights(
  books: GeneralBookDoc[],
  tokens: string[],
): Map<string, number> {
  const sections: string[] = [];
  for (const book of books) {
    for (const part of book.parts) {
      for (const section of part.sections) {
        if (section.kind !== 'content') continue;
        sections.push(`${section.title} ${(section.concepts ?? []).join(' ')}`);
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
 * يزن توكنز السؤال عكسيًا مع تواترها في كتالوج الدروس المرشّحة (idf):
 * المفردة النادرة (المبتدأ) تُرجَّح فوق الكلمة العامة المتكررة في العناوين
 * (الفرق، بين، اللغة...) فيعلو درس الموضوع الحقيقي على دروس الصلة العامة.
 * كتالوج الدروس يختلف عن كتالوج أقسام الكتب العامة فلا تُعيد استخدام
 * computeTokenWeights بل يرجّح كل طبقة على مجتمعها الإحصائي.
 */
export function computeLessonTokenWeights(
  lessons: {
    title: string;
    summary: string | null;
    learning_objectives: unknown;
  }[],
  tokens: string[],
): Map<string, number> {
  const texts = lessons.map((lesson) => {
    const objectives = Array.isArray(lesson.learning_objectives)
      ? lesson.learning_objectives.join(' ')
      : '';
    return `${lesson.title} ${lesson.summary ?? ''} ${objectives}`;
  });
  const total = Math.max(texts.length, 1);
  const weights = new Map<string, number>();
  for (const token of tokens) {
    let df = 0;
    for (const text of texts) {
      if (textMatchesToken(text, token)) df += 1;
    }
    weights.set(token, Math.max(0.5, Math.log((total + 1) / (df + 1))));
  }
  return weights;
}

export function scoreLesson(
  lesson: {
    title: string;
    summary: string | null;
    learning_objectives: unknown;
  },
  tokens: string[],
  weights: Map<string, number>,
): number {
  const title = lesson.title.toLowerCase();
  const summary = (lesson.summary ?? '').toLowerCase();
  const objectives = Array.isArray(lesson.learning_objectives)
    ? lesson.learning_objectives.join(' ').toLowerCase()
    : '';

  let score = 0;
  let contentMatch = false;
  for (const token of tokens) {
    // الوزن: MINOR_TOKENS تُمنح وزنًا منخفضًا ثابتًا حتى لا يرفع درس
    // "الفرق بين..." فوق دروس التوكنز الجوهرية، ويُحسب الباقي بـ idf.
    const w = MINOR_TOKENS.has(token) ? 0.5 : (weights.get(token) ?? 1);
    const tMatch = textMatchesToken(title, token);
    const sMatch = textMatchesToken(summary, token);
    const oMatch = textMatchesToken(objectives, token);
    if (tMatch) score += 3 * w;
    if (sMatch) score += 2 * w;
    if (oMatch) score += 1 * w;
    if ((tMatch || sMatch || oMatch) && !MINOR_TOKENS.has(token)) {
      contentMatch = true;
    }
  }
  // درسٌ لا يطابق أي مفردة جوهرية (title/summary/objectives) لا يُنتخب
  // لـ L1 — يستبعد دروس المقارنات العامة التي تصل بتوكنز MINOR وحدها.
  return contentMatch ? score : 0;
}

/**
 * يرصد كل أقسام الكتاب المجتازة لبوابة الصلة: تطابق توكنز السؤال مع
 * العنوان أو المفاهيم، مع إمّا مفردة جوهرية على الأقل (contentMatch).
 * تُرجع المرشّحين بنتائجهم مرتّبة تنازليًا لتُرَتَّب على مستوى الكتب كافة
 * وتُقتطع حسب الميزانية في retrieve.
 */
export function candidateSections(
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

import { splitMarkdown, type Chunk } from './chunker.js';
import type { MarkdownDoc, MarkdownLoader } from './markdown-loader.js';
import {
  addedSubstantiveTokens,
  coveredSubstantiveTokens,
} from './rag.gate.js';
import { scoreChunk } from './rag.scoring.js';

export interface Layer2Candidate {
  doc: MarkdownDoc;
  chunk: Chunk;
  score: number;
}

/**
 * الطبقة 2: مقاطع chunked من الكتاب المدرسي/المراجع — تُقيَّم وتُختار
 * ضمن ميزانية الحروف المتبقية بعد الطبقة 1.
 */
export class Layer2Builder {
  constructor(
    private readonly markdown: MarkdownLoader,
    private readonly maxChars: number,
  ) {}

  /** يجمع مرشّحين الطبقة 2 (مقاطع chunked) — يصلح للبناء المتوازي. */
  buildCandidates(
    opts: { subjectId?: number | null; gradeId?: number | null },
    tokens: string[],
    tokenWeights: Map<string, number>,
  ): Layer2Candidate[] {
    const chunkCandidates: Layer2Candidate[] = [];
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
  select(
    candidates: Layer2Candidate[],
    tokens: string[],
    block1: string,
  ): string {
    const represented = coveredSubstantiveTokens(tokens, block1);
    const budget = Math.max(0, this.maxChars - block1.length);

    // الكتاب المدرسي هو الحقيقة المطلقة والفيصل عند التعارض: تُقدَّم مقاطعه
    // أولًا (ثابت ضمن نوعه بالوزن) حتى يدخل "الحَكَم" النافذة قبل المراجع.
    const prioritized = [...candidates].sort((a, b) => {
      const ta = a.doc.type === 'textbook' ? 0 : 1;
      const tb = b.doc.type === 'textbook' ? 0 : 1;
      if (ta !== tb) return ta - tb;
      return b.score - a.score;
    });

    const markdownBlock: string[] = [];
    let used = 0;
    for (const cand of prioritized) {
      const addedTokens = addedSubstantiveTokens(
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
}

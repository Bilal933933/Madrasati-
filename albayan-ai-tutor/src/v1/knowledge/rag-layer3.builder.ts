import type {
  BookSection,
  GeneralBookDoc,
  MarkdownLoader,
} from './markdown-loader.js';
import {
  addedSubstantiveTokens,
  coveredSubstantiveTokens,
} from './rag.gate.js';
import { candidateSections } from './rag.scoring.js';

/**
 * الطبقة 3: أقسام المراجع العامة — تُقرأ كسولةً من القرص فقط عند عدم كفاية
 * الطبقتين 1 و2 لبوابة الكفاية، وضمن ميزانية الحروف المتبقية. الكسب
 * الهامشي ينطبق أيضًا: قسمٌ يعيد توكنز جوهرية نُصِّفت لا يُقرأ.
 */
export class Layer3Builder {
  constructor(
    private readonly markdown: MarkdownLoader,
    private readonly maxChars: number,
  ) {}

  build(
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
      for (const cand of candidateSections(book, tokens, tokenWeights)) {
        candidates.push({ ...cand, book });
      }
    }
    candidates.sort((a, b) => b.score - a.score);

    const represented = coveredSubstantiveTokens(tokens, windowBefore);
    const budget = Math.max(0, this.maxChars - windowBefore.length);

    const generalBlock: string[] = [];
    let used = 0;
    for (const cand of candidates) {
      const text = this.markdown.readSection(cand.book, cand.section);
      if (!text) continue;
      const addedTokens = addedSubstantiveTokens(
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
}

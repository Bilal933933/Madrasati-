import { EmbeddingService } from './embedding.service.js';
import {
  addedSubstantiveTokens,
  coveredSubstantiveTokens,
} from './rag.gate.js';
import { scoreChunk } from './rag.scoring.js';
import type { VectorSearchHit, VectorService } from './vector.service.js';

export interface SemanticSelection {
  block: string;
  used: { docPath: string; docType: string; similarity: number }[];
}

/**
 * الطبقة الدلالية: يستعلم قاعدة المتجهات بتضمين السؤال. تُبنى بالتوازي مع
 * الطبقتين 1 و2، وتُدمج عبر RRF مع المرشّحين المعجميين. غياب الخدمتين
 * (اختبار/بيئة) أو فشلهما يُرجع [] فيُستكمل المعجمي بلا انهيار.
 */
export class SemanticLayerBuilder {
  constructor(
    private readonly embedding: EmbeddingService | undefined,
    private readonly vector: VectorService | undefined,
    private readonly rrfK: number,
    private readonly maxChars: number,
    private readonly semanticTopK: number,
  ) {}

  async buildCandidates(
    question: string,
    opts: { subjectId?: number | null; gradeId?: number | null },
  ): Promise<VectorSearchHit[]> {
    if (!this.embedding || !this.vector) return [];
    const queryVector = await this.embedding.embed(question);
    return this.vector.search(queryVector, {
      subjectId: opts.subjectId ?? null,
      gradeId: opts.gradeId ?? null,
      topK: this.semanticTopK,
    });
  }

  /**
   * يختار مقاطع الطبقة الدلالية بترتيب RRF (دمج رتبتي التشابه الدلالي والوزن
   * المعجمي)، مع الكسب الهامشي والميزانية نفسَين للطبقات الباقية.
   * يُرجع الكتلة مع المقاطع المضمومة فعلًا للتشخيص.
   */
  select(
    hits: VectorSearchHit[],
    tokens: string[],
    windowBefore: string,
  ): SemanticSelection {
    if (hits.length === 0) return { block: '', used: [] };

    // رتبة دلالية (تنازليًا بالتشابه) ورتبة معجمية (تنازليًا بالوزن).
    const semanticOrder = [...hits].sort((a, b) => b.similarity - a.similarity);
    const lexicalWeights = new Map(tokens.map((t) => [t, 1]));
    const lexicalOrder = [...hits].sort((a, b) => {
      const sa = scoreChunk(
        {
          id: a.docKey,
          heading: a.heading ?? '',
          text: a.text,
          startPage: a.pageStart,
          endPage: a.pageEnd,
          wordCount: 0,
        },
        tokens,
        lexicalWeights,
      ).score;
      const sb = scoreChunk(
        {
          id: b.docKey,
          heading: b.heading ?? '',
          text: b.text,
          startPage: b.pageStart,
          endPage: b.pageEnd,
          wordCount: 0,
        },
        tokens,
        lexicalWeights,
      ).score;
      return sb - sa;
    });

    const rankOf = (ordered: VectorSearchHit[], hit: VectorSearchHit): number =>
      ordered.findIndex((h) => h.docKey === hit.docKey);

    // RRF: 1/(k+rankSemantic) + 1/(k+rankLexical).
    const fused = [...hits].sort((a, b) => {
      const ra =
        1 / (this.rrfK + rankOf(semanticOrder, a)) +
        1 / (this.rrfK + rankOf(lexicalOrder, a));
      const rb =
        1 / (this.rrfK + rankOf(semanticOrder, b)) +
        1 / (this.rrfK + rankOf(lexicalOrder, b));
      return rb - ra;
    });

    const represented = coveredSubstantiveTokens(tokens, windowBefore);
    const budget = Math.max(0, this.maxChars - windowBefore.length);

    const semanticBlock: string[] = [];
    const used: { docPath: string; docType: string; similarity: number }[] = [];
    let usedChars = 0;

    for (const hit of fused) {
      const added = addedSubstantiveTokens(
        tokens,
        `${hit.heading ?? ''} ${hit.text}`,
        represented,
      );
      if (added.length === 0) continue;
      const label =
        hit.docType === 'general'
          ? 'كتاب عام'
          : hit.docType === 'lesson'
            ? 'درس المنصة'
            : hit.docType === 'reference'
              ? 'مرجع عام'
              : 'من الكتاب المدرسي';
      const heading = hit.heading?.trim();
      const block = `### ${hit.docPath} — [${label}]${heading ? ` — ${heading}` : ''}\n${hit.text}`;
      if (semanticBlock.length > 0 && usedChars + block.length > budget) break;
      semanticBlock.push(block);
      usedChars += block.length;
      used.push({
        docPath: hit.docPath,
        docType: hit.docType,
        similarity: hit.similarity,
      });
      // تُعتبر التوكنز المضافة ممثلة للمقاطع اللاحقة (كسب هامشي متسلسل).
      for (const token of added) represented.add(token);
    }

    if (semanticBlock.length === 0) return { block: '', used: [] };
    return {
      block: `## الطبقة الدلالية: بحث دلالي\n${semanticBlock.join('\n\n')}`,
      used,
    };
  }
}

import { Injectable, Optional } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmbeddingService } from './embedding.service.js';
import { MarkdownLoader } from './markdown-loader.js';
import { Layer1Builder } from './rag-layer1.builder.js';
import { Layer2Builder } from './rag-layer2.builder.js';
import { Layer3Builder } from './rag-layer3.builder.js';
import { SemanticLayerBuilder } from './rag-semantic.builder.js';
import { isLayerSufficient } from './rag.gate.js';
import { computeTokenWeights } from './rag.scoring.js';
import { tokenize } from './rag.tokenizer.js';
import { VectorService } from './vector.service.js';

export interface RagResult {
  lessons: { id: number; title: string; summary: string | null }[];
  contentWindow: string;
  sources: { lessonId: number; lessonTitle: string }[];
  /** مقاطع من قاعدة المتجهات شاركت في النافذة — إفادة التشخيص. */
  semanticHits: { docPath: string; docType: string; similarity: number }[];
}

/**
 * المنسّق العام لنظام RAG الهجين:
 * 1) الطبقة 1: الدروس المطابقة من المنصة (استعلام DB).
 * 2) الطبقة 2: مقاطع الكتاب المدرسي/المراجع المطابقة (في الذاكرة) — تعمل
 *    بالتوازي مع الطبقة 1 عبر Promise.allSettled لأنها رخيصة.
 * 3) الطبقة 3: أقسام المراجع العامة (قراءات قرص) — كسولة تسلسلية، لا تُبنى
 *    إلا عند عدم كفاية الطبقتين 1 و2 لبوابة الكفاية.
 * 4) الطبقة الدلالية: قاعدة المتجهات عبر RRF — كسولة أيضًا.
 * بوابة الكفاية: تغطية نسبة التوكنز الجوهرية للسؤال ≥ العتبة
 * (RAG_SUFFICIENCY_COVERAGE، افتراضي 0.6) وسور الطول الثانوي
 * (RAG_MIN_CONTENT_CHARS، افتراضي 120). الكسب الهامشي بين الطبقات: لا يُضم
 * مقطع/قسم يعيد توكنز جوهرية نُصِّفت بالفعل في النافذة الحالية.
 *
 * كل بناء طبقة منفصل في فئته الخاصة (Layer1Builder/Layer2Builder/
 * Layer3Builder/SemanticLayerBuilder) — هذا الملف منسّق فقط.
 */
@Injectable()
export class RagService {
  private readonly maxChars: number;
  private readonly coverageThreshold: number;
  private readonly minContentChars: number;
  private readonly logger?: LoggerService;
  private readonly layer1: Layer1Builder;
  private readonly layer2: Layer2Builder;
  private readonly layer3: Layer3Builder;
  private readonly semantic: SemanticLayerBuilder;

  constructor(
    prisma: PrismaService,
    private readonly markdown: MarkdownLoader,
    @Optional() embedding?: EmbeddingService,
    @Optional() vector?: VectorService,
    logger?: LoggerService,
  ) {
    this.logger = logger;

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

    const topK = Number.parseInt(process.env.VECTOR_TOP_K ?? '', 10);
    const semanticTopK = Number.isFinite(topK) && topK > 0 ? topK : 20;

    const k = Number.parseInt(process.env.RRF_K ?? '', 10);
    const rrfK = Number.isFinite(k) && k > 0 ? k : 60;

    this.layer1 = new Layer1Builder(prisma, logger);
    this.layer2 = new Layer2Builder(markdown, this.maxChars);
    this.layer3 = new Layer3Builder(markdown, this.maxChars);
    this.semantic = new SemanticLayerBuilder(
      embedding,
      vector,
      rrfK,
      this.maxChars,
      semanticTopK,
    );
  }

  async retrieve(
    question: string,
    opts: { subjectId?: number | null; gradeId?: number | null },
  ): Promise<RagResult> {
    const tokens = tokenize(question);
    if (tokens.length === 0) {
      return { lessons: [], contentWindow: '', sources: [], semanticHits: [] };
    }

    // الأوزان IDF تُحسب مرة واحدة وتُشارك بين الطبقتين 2 و3 لاتساق الصلة.
    const tokenWeights = computeTokenWeights(
      this.markdown.matchingGeneral({
        subjectId: opts.subjectId,
        gradeId: opts.gradeId,
      }),
      tokens,
    );

    const layerErrors: unknown[] = [];

    // الطبقة 1 (DB) والطبقة 2 (ذاكرة) — تدهور سعيد: فشل أي مكوّن لا يفشل
    // الطلب، بل يُكمَل من المكونات الباقية.
    const [layer1, layer2] = await Promise.allSettled([
      this.layer1.build(opts, tokens),
      Promise.resolve(this.layer2.buildCandidates(opts, tokens, tokenWeights)),
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
      block2 = this.layer2.select(layer2.value, tokens, block1);
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
    if (!this.isSufficient(contentWindow, tokens)) {
      try {
        const block3 = this.layer3.build(
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

    // الطبقة الدلالية كسولة: تُستعلم قاعدة المتجهات فقط عند عدم كفاية
    // الطبقات 1-3 معًا، وتُدمج عبر RRF مع المرشّحين المعجميين.
    let semanticHits: RagResult['semanticHits'] = [];
    if (!this.isSufficient(contentWindow, tokens)) {
      const semantic = await Promise.allSettled([
        this.semantic.buildCandidates(question, opts),
      ]);
      if (semantic[0].status === 'fulfilled' && semantic[0].value.length > 0) {
        const selection = this.semantic.select(
          semantic[0].value,
          tokens,
          contentWindow,
        );
        if (selection.block) {
          layers.push(selection.block);
          contentWindow = layers.join('\n\n');
        }
        semanticHits = selection.used;
      } else if (semantic[0].status === 'rejected') {
        layerErrors.push(semantic[0].reason);
        this.logger?.warn(
          { event: 'rag.semantic_failed' },
          'فشل البحث الدلالي — يُكمَل بالنافذة المعجمية فقط',
          {
            subjectId: opts.subjectId,
            gradeId: opts.gradeId,
            error:
              semantic[0].reason instanceof Error
                ? semantic[0].reason.message
                : String(semantic[0].reason),
          },
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

    return { lessons, contentWindow, sources, semanticHits };
  }

  private isSufficient(contentWindow: string, tokens: string[]): boolean {
    return isLayerSufficient(contentWindow, tokens, {
      minContentChars: this.minContentChars,
      coverageThreshold: this.coverageThreshold,
    });
  }
}

export { normalizeArabic } from './rag.tokenizer.js';
export { scoreChunk } from './rag.scoring.js';

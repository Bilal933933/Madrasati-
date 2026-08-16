import { PrismaService } from '../prisma/prisma.service.js';
import { EmbeddingService } from './embedding.service.js';
import { MarkdownLoader } from './markdown-loader.js';
import { RagService } from './rag.service.js';
import { VectorService, type VectorSearchHit } from './vector.service.js';

function hit(overrides: Partial<VectorSearchHit>): VectorSearchHit {
  return {
    docKey: 'abc123',
    docPath: 'textbook/primary/primary_4/اللغة العربية/النحو/m1.md',
    docType: 'textbook',
    subjectId: 5,
    gradeId: 8,
    lessonId: null,
    heading: 'المبتدأ',
    text: 'المبتدأ اسم مرفوع يقع أول الجملة، والخبر يتمم معنى المبتدأ.',
    pageStart: 1,
    pageEnd: 1,
    similarity: 0.85,
    ...overrides,
  };
}

describe('RagService — الطبقة الدلالية (Hybrid/RRF)', () => {
  const prismaMock = {
    lessons: { findMany: jest.fn() },
    paragraphs: { findMany: jest.fn() },
  };
  const markdownMock = {
    matching: jest.fn(),
    matchingGeneral: jest.fn(),
    readSection: jest.fn(),
  };
  const embeddingMock = { embed: jest.fn() };
  const vectorMock = { search: jest.fn() };

  let rag: RagService;

  const buildRag = () =>
    new RagService(
      prismaMock as unknown as PrismaService,
      markdownMock as unknown as MarkdownLoader,
      embeddingMock as unknown as EmbeddingService,
      vectorMock as unknown as VectorService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    rag = buildRag();
    prismaMock.lessons.findMany.mockResolvedValue([]);
    prismaMock.paragraphs.findMany.mockResolvedValue([]);
    markdownMock.matching.mockReturnValue([]);
    markdownMock.matchingGeneral.mockReturnValue([]);
    embeddingMock.embed.mockResolvedValue([0.1, 0.2, 0.3]);
  });

  describe('الإثراء الدلالي عند الحاجة', () => {
    it('سؤال لا يغطيه المعجمي: يُضم مقطع دلالي غني بمفردات جديدة', async () => {
      vectorMock.search.mockResolvedValue([
        hit({
          docKey: 'sem1',
          docPath: 'textbook/primary/primary_4/اللغة العربية/النحو/m1.md',
          heading: 'علامات رفع المبتدأ',
          text: 'علامات رفع المبتدأ ثلاث: الضمة الظاهرة، والألف في المثنى، والواو في جمع المذكر السالم.',
          similarity: 0.91,
        }),
      ]);

      const result = await rag.retrieve('ما علامات رفع المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة الدلالية');
      expect(result.contentWindow).toContain('الضمة الظاهرة');
      expect(result.semanticHits).toEqual([
        {
          docPath: 'textbook/primary/primary_4/اللغة العربية/النحو/m1.md',
          docType: 'textbook',
          similarity: 0.91,
        },
      ]);
    });

    it('لا يُبنى عندما يكفي المعجمي وحده (بوابة الكفاية)', async () => {
      // طبقة 1 تغطي كل التوكنز الجوهرية بطول يتجاوز سور الـ 120 حرفًا.
      prismaMock.lessons.findMany.mockResolvedValue([
        {
          id: 1n,
          title: 'المبتدأ',
          summary: 'مبتدأ مرفوع',
          learning_objectives: [],
        },
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"المبتدأ اسم مرفوع يقع أول الجملة الاسمية، والمبتدأ دائم التصدير، ويرفع بالضمة الظاهرة."}]}]}',
        },
      ]);
      vectorMock.search.mockResolvedValue([hit({ similarity: 0.99 })]);

      const result = await rag.retrieve('ما المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة 1');
      expect(result.contentWindow).not.toContain('## الطبقة الدلالية');
      expect(result.semanticHits).toEqual([]);
      // لم يُستعلَم البحث الدلالي أصلًا (كسولة).
      expect(vectorMock.search).not.toHaveBeenCalled();
    });
  });

  describe('كسب هامشي دلالي', () => {
    it('مقطع دلالي يعيد توكنز نُصِّفت بالفعل لا يُضم', async () => {
      // الطبقة 1 تغطي "المبتدأ" و"مرفوع" فقط — لا "الخبر".
      prismaMock.lessons.findMany.mockResolvedValue([
        {
          id: 1n,
          title: 'المبتدأ',
          summary: 'مبتدأ مرفوع يقع أول الجملة',
          learning_objectives: [],
        },
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"المبتدأ اسم مرفوع يقع أول الجملة"}]}]}',
        },
      ]);
      // مقطع يعيد نفس التوكنز فقط (مبتدأ) — بلا جديد.
      vectorMock.search.mockResolvedValue([
        hit({
          docKey: 'dup',
          heading: 'المبتدأ',
          text: 'المبتدأ اسم مرفوع يقع أول الجملة',
          similarity: 0.95,
        }),
      ]);

      const result = await rag.retrieve('ما المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).not.toContain('## الطبقة الدلالية');
      expect(result.semanticHits).toEqual([]);
    });
  });

  describe('انهيار سعيد عند فشل/غياب الخدمات', () => {
    it('فشل التضمين لا يفشل الطلب ويكمل معجميًا', async () => {
      embeddingMock.embed.mockRejectedValue(new Error('quota exhausted'));
      prismaMock.lessons.findMany.mockResolvedValue([
        {
          id: 1n,
          title: 'المبتدأ',
          summary: 'مبتدأ مرفوع',
          learning_objectives: [],
        },
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"المبتدأ اسم مرفوع يقع أول الجملة."}]}]}',
        },
      ]);

      const result = await rag.retrieve('ما المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة 1');
      expect(result.semanticHits).toEqual([]);
    });

    it('بدون الخدمتين (اختبار/بيئة معجمية) لا يُنشأ البحث الدلالي أصلًا', async () => {
      const lexicalOnly = new RagService(
        prismaMock as unknown as PrismaService,
        markdownMock as unknown as MarkdownLoader,
      );
      prismaMock.lessons.findMany.mockResolvedValue([
        {
          id: 1n,
          title: 'المبتدأ',
          summary: 'مبتدأ مرفوع',
          learning_objectives: [],
        },
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"المبتدأ اسم مرفوع يقع أول الجملة."}]}]}',
        },
      ]);

      const result = await lexicalOnly.retrieve('ما المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(embeddingMock.embed).not.toHaveBeenCalled();
      expect(vectorMock.search).not.toHaveBeenCalled();
      expect(result.contentWindow).toContain('## الطبقة 1');
    });
  });

  describe('تصفية السياق (subject/grade)', () => {
    it('يمرّر معرفات المادة والصف إلى البحث الدلالي', async () => {
      vectorMock.search.mockResolvedValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([
        { id: 1n, title: 'المبتدأ', summary: 'مبتدأ', learning_objectives: [] },
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"المبتدأ اسم مرفوع"}]}]}',
        },
      ]);

      await rag.retrieve('ما المبتدأ؟', { subjectId: 5, gradeId: 8 });

      expect(embeddingMock.embed).toHaveBeenCalledWith('ما المبتدأ؟');
      expect(vectorMock.search).toHaveBeenCalledWith(
        [0.1, 0.2, 0.3],
        expect.objectContaining({ subjectId: 5, gradeId: 8 }),
      );
    });
  });
});

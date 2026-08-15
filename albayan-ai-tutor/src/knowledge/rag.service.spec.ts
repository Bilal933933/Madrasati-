import { PrismaService } from '../prisma/prisma.service.js';
import {
  BookSection,
  GeneralBookDoc,
  MarkdownLoader,
} from './markdown-loader.js';
import { splitMarkdown, type Chunk } from './chunker.js';
import { normalizeArabic, RagService, scoreChunk } from './rag.service.js';

describe('RagService', () => {
  const prismaMock = {
    lessons: { findMany: jest.fn() },
    paragraphs: { findMany: jest.fn() },
  };

  const markdownMock = {
    matching: jest.fn(),
    matchingGeneral: jest.fn(),
    readSection: jest.fn(),
  };

  let rag: RagService;

  beforeEach(() => {
    jest.clearAllMocks();
    rag = new RagService(
      prismaMock as unknown as PrismaService,
      markdownMock as unknown as MarkdownLoader,
    );
  });

  describe('normalizeArabic', () => {
    it('يجرد التشكيل ويوحد التاء المربوطة', () => {
      expect(normalizeArabic('الْمِيزَانُ الصَّرْفِيُّ')).toBe(
        'الميزان الصرفي',
      );
      expect(normalizeArabic('رَمَضَانُ')).toBe('رمضان');
      expect(normalizeArabic('صَفْحَةً')).toBe('صفحه');
    });
  });

  describe('topSections مع الفهرس المشكول', () => {
    it('يطابق سؤال "الميزان الصرفي" مع القسم المشكول ويصدّر أعلاها', () => {
      const book: GeneralBookDoc = {
        id: 'sarf',
        title: 'كيف تتقن الصرف؟',
        author: null,
        subjectName: 'اللغة العربية',
        totalPages: 617,
        rootPath: '/books/sarf',
        subjectIds: [5],
        gradeIds: [4],
        parts: [
          {
            file: 'part-01.md',
            pages: [1, 40],
            chapter: null,
            sections: [
              {
                id: 'c001',
                title: 'الْمِيزَانُ الصَّرْفِيُّ',
                kind: 'content',
                page: 17,
                concepts: ['ميزان', 'صرفي'],
              },
              {
                id: 'c002',
                title: 'خَرِيطَةٌ ذِهْنِيَّةٌ لِكِتَابِ الصَّرْفِ',
                kind: 'content',
                page: 7,
                concepts: ['خريطة', 'ذهنية'],
              },
              {
                id: 'n001',
                title: 'الْمُقَدِّمَةُ',
                kind: 'noise',
                page: 6,
                concepts: [],
              },
            ],
          },
        ],
      };

      // الوصول للخاصة topSections عبر استدعاء retrieve مع فعلية المطابقة.
      markdownMock.matchingGeneral.mockReturnValue([book]);
      markdownMock.matching.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);
      markdownMock.readSection.mockImplementation(
        (b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      return rag
        .retrieve('ما هو الميزان الصرفي؟', { subjectId: 5, gradeId: null })
        .then((result) => {
          const called = markdownMock.readSection.mock.calls.map(
            (c: [GeneralBookDoc, BookSection]) => c[1].title,
          );
          expect(called).toContain('الْمِيزَانُ الصَّرْفِيُّ');
          expect(result.contentWindow).toContain('الْمِيزَانُ الصَّرْفِيُّ');
          expect(result.contentWindow).not.toContain('خَرِيطَةٌ ذِهْنِيَّةٌ');
        });
    });

    it('لا يقرأ أقسام الضجيج (noise)', () => {
      const book: GeneralBookDoc = {
        id: 'nahw',
        title: 'كيف تتقن النحو؟',
        author: null,
        subjectName: 'اللغة العربية',
        totalPages: 553,
        rootPath: '/books/nahw',
        subjectIds: [5],
        gradeIds: [4],
        parts: [
          {
            file: 'part-01.md',
            pages: [1, 40],
            chapter: null,
            sections: [
              {
                id: 'n001',
                title: 'الْغِلَافُ',
                kind: 'noise',
                page: 1,
                concepts: [],
              },
            ],
          },
        ],
      };

      markdownMock.matchingGeneral.mockReturnValue([book]);
      markdownMock.matching.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);

      return rag
        .retrieve('ما هو الغلاف؟', { subjectId: 5, gradeId: null })
        .then((result) => {
          expect(markdownMock.readSection).not.toHaveBeenCalled();
          expect(result.contentWindow).not.toContain('الْغِلَافُ');
        });
    });
  });

  describe('أولوية المبحث الحقيقي على المقارنات العامة', () => {
    it('سؤال "الفرق بين المبتدأ والخبر" يقرأ المبحثين ولا يقرأ "بينما" ولا "لا الناهية"', () => {
      const book: GeneralBookDoc = {
        id: 'nahw',
        title: 'كيف تتقن النحو؟',
        author: null,
        subjectName: 'اللغة العربية',
        totalPages: 553,
        rootPath: '/books/nahw',
        subjectIds: [5],
        gradeIds: [4],
        parts: [
          {
            file: 'part-01.md',
            pages: [1, 60],
            chapter: null,
            sections: [
              {
                id: 'n148',
                title: 'المبحث الثالث الْمُبْتَدَأُ',
                kind: 'content',
                page: 148,
                concepts: ['مبتدأ', 'مرفوع', 'جملة اسمية'],
              },
              {
                id: 'n154',
                title: 'الْخَبَرِ وأنواعه',
                kind: 'content',
                page: 154,
                concepts: ['خبر', 'مرفوع', 'مفرد', 'جملة'],
              },
              {
                id: 'n093',
                title: 'حيث منذ قط الآن أيان ثم ثمة بينما ريثما',
                kind: 'content',
                page: 93,
                concepts: ['ظروف مبنية'],
              },
              {
                id: 'n136',
                title: 'الفرق بين لا الناهية ولا النافية',
                kind: 'content',
                page: 136,
                concepts: ['نفي', 'جزم'],
              },
            ],
          },
        ],
      };

      markdownMock.matchingGeneral.mockReturnValue([book]);
      markdownMock.matching.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);
      markdownMock.readSection.mockImplementation(
        (b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      return rag
        .retrieve('ما الفرق بين المبتدأ والخبر؟', {
          subjectId: 5,
          gradeId: null,
        })
        .then((result) => {
          const calledTitles = markdownMock.readSection.mock.calls.map(
            (c: [GeneralBookDoc, BookSection]) => c[1].title,
          );
          expect(calledTitles).toContain('المبحث الثالث الْمُبْتَدَأُ');
          expect(calledTitles).toContain('الْخَبَرِ وأنواعه');
          expect(calledTitles).not.toContain(
            'حيث منذ قط الآن أيان ثم ثمة بينما ريثما',
          );
          expect(calledTitles).not.toContain(
            'الفرق بين لا الناهية ولا النافية',
          );
          expect(result.contentWindow).not.toContain('بينما ريثما');
        });
    });

    it('السؤال بمفردة نادرة يُرجّح على القسم بلفظ عام', () => {
      const book: GeneralBookDoc = {
        id: 'nahw',
        title: 'كيف تتقن النحو؟',
        author: null,
        subjectName: 'اللغة العربية',
        totalPages: 553,
        rootPath: '/books/nahw',
        subjectIds: [5],
        gradeIds: [4],
        parts: [
          {
            file: 'part-01.md',
            pages: [1, 60],
            chapter: null,
            sections: [
              {
                id: 'm1',
                title: 'الْمِيزَانُ الصَّرْفِيُّ',
                kind: 'content',
                page: 17,
                concepts: ['ميزان', 'صرفي'],
              },
              {
                id: 'g1',
                title: 'القاعدة العامة في كلام العرب',
                kind: 'content',
                page: 3,
                concepts: ['كلام العربي'],
              },
            ],
          },
        ],
      };

      markdownMock.matchingGeneral.mockReturnValue([book]);
      markdownMock.matching.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);
      markdownMock.readSection.mockImplementation(
        (b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      return rag
        .retrieve('ما هو الميزان الصرفي؟', {
          subjectId: 5,
          gradeId: null,
        })
        .then(() => {
          const calledTitles = markdownMock.readSection.mock.calls.map(
            (c: [GeneralBookDoc, BookSection]) => c[1].title,
          );
          expect(calledTitles[0]).toBe('الْمِيزَانُ الصَّرْفِيُّ');
        });
    });
  });

  describe('قراءة كل الأقسام المطابقة للموضوع', () => {
    it('سؤال "المبتدأ" يقرأ كل الأقسام السبعة المعنية بما فيها "أنواع المبتدأ" بدل الاكتفاء بأربعة', () => {
      const book: GeneralBookDoc = {
        id: 'nahw',
        title: 'كيف تتقن النحو؟',
        author: null,
        subjectName: 'اللغة العربية',
        totalPages: 553,
        rootPath: '/books/nahw',
        subjectIds: [5],
        gradeIds: [4],
        parts: [
          {
            file: 'part-01.md',
            pages: [1, 60],
            chapter: null,
            sections: [
              {
                id: 's148',
                title: 'المبحث الثالث الْمُبْتَدَأُ',
                kind: 'content',
                page: 148,
                concepts: ['مبتدأ', 'مرفوع', 'جملة اسمية'],
              },
              {
                id: 's189',
                title: 'مواضع حذف المبتدأ وجوبا',
                kind: 'content',
                page: 189,
                concepts: ['مبتدأ محذوف'],
              },
              {
                id: 's191',
                title: 'المبتدأ الذي لا يحتاج إلى خبر يكتفي بمرفوعه',
                kind: 'content',
                page: 191,
                concepts: ['مبتدأ'],
              },
              {
                id: 's193',
                title: 'ملخص المبتدأ',
                kind: 'content',
                page: 193,
                concepts: ['مبتدأ'],
              },
              {
                id: 's198',
                title: 'تقديم الخبر على المبتدأ',
                kind: 'content',
                page: 198,
                concepts: ['مبتدأ', 'خبر'],
              },
              {
                id: 's202',
                title: 'المُبْتَدَأُ وَالْخَبَرُ فِي صَفْحَةٍ وَاحِدَةٍ',
                kind: 'content',
                page: 202,
                concepts: ['أنواع المبتدأ', 'أنواع الخبر'],
              },
              {
                id: 's203',
                title: 'تَدْرِيبٌ عَلَى المبحث الثالث المبتدأ والخبر',
                kind: 'content',
                page: 203,
                concepts: ['مبتدأ', 'خبر'],
              },
            ],
          },
        ],
      };

      markdownMock.matchingGeneral.mockReturnValue([book]);
      markdownMock.matching.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);
      markdownMock.readSection.mockImplementation(
        (b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      return rag
        .retrieve('ما هو المبتدأ وأشكاله؟', {
          subjectId: 5,
          gradeId: null,
        })
        .then((result) => {
          const calledTitles = markdownMock.readSection.mock.calls.map(
            (c: [GeneralBookDoc, BookSection]) => c[1].title,
          );
          expect(calledTitles).toContain(
            'المُبْتَدَأُ وَالْخَبَرُ فِي صَفْحَةٍ وَاحِدَةٍ',
          );
          expect(calledTitles).toHaveLength(7);
          expect(result.contentWindow).toContain(
            'المُبْتَدَأُ وَالْخَبَرُ فِي صَفْحَةٍ وَاحِدَةٍ',
          );
        });
    });
  });

  describe('الطبقة 2 — تقييم ملفات المدرسي/المراجع بالسؤال بدل ضخها كاملة', () => {
    const doc = (title: string, body: string) => ({
      path: 'textbook/primary/primary_4/اللغة العربية/النحو/lesson.md',
      type: 'textbook' as const,
      stageKey: 'primary',
      gradeKey: 'primary_4',
      subjectName: 'اللغة العربية',
      courseName: 'النحو',
      title,
      body,
      subjectId: 5,
      gradeId: 8,
    });

    it('يختار مقطع الملف المطابق ويسقط الملف غير ذي الصلة', async () => {
      markdownMock.matching.mockReturnValue([
        doc(
          'درس المبتدأ والخبر',
          '## المبتدأ\nالمبتدأ اسم مرفوع يقع أول الجملة.\n\n## الخبر\nالخبر يتمم معنى المبتدأ.',
        ),
        doc('درس التنوين', '## التنوين\nالتنوين نون ساكنة تلحق آخر الاسم.'),
      ]);
      markdownMock.matchingGeneral.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);

      const result = await rag.retrieve('ما المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('المبتدأ اسم مرفوع');
      expect(result.contentWindow).not.toContain('التنوين نون ساكنة');
    });

    it('بسقف ضيق يُسقط الطبقة الزائدة كاملة ولا يقطع وسط النص', async () => {
      const original = process.env.AI_RAG_MAX_CHARS;
      process.env.AI_RAG_MAX_CHARS = '180';
      try {
        rag = new RagService(
          prismaMock as unknown as PrismaService,
          markdownMock as unknown as MarkdownLoader,
        );
        prismaMock.lessons.findMany.mockResolvedValue([
          {
            id: 1n,
            title: 'المبتدأ',
            summary: 'مبتدأ مرفوع يقع أول الجملة.',
            learning_objectives: [],
          },
        ]);
        prismaMock.paragraphs.findMany.mockResolvedValue([
          { lesson_id: 1n, title: 'المبتدأ', content: 'مبتدأ مرفوع' },
        ]);
        markdownMock.matching.mockReturnValue([
          doc('درس طويل', `## المبتدأ\n${'كلمة '.repeat(60)}`),
        ]);
        markdownMock.matchingGeneral.mockReturnValue([]);

        const result = await rag.retrieve('ما المبتدأ؟', {
          subjectId: 5,
          gradeId: null,
        });

        expect(result.contentWindow.length).toBeLessThanOrEqual(180);
        expect(result.contentWindow).toContain('مبتدأ مرفوع');
        expect(result.contentWindow).not.toContain('كلمة');
      } finally {
        if (original === undefined) delete process.env.AI_RAG_MAX_CHARS;
        else process.env.AI_RAG_MAX_CHARS = original;
      }
    });

    it('في مستند يتجاوز هدف التقطيع يُسقط قسم غير مطابق إلى قطعة مستقلة', async () => {
      const words = (n: number, seed: number) =>
        Array.from({ length: n }, (_, i) => `كلمة${seed + i}`).join(' ');
      markdownMock.matching.mockReturnValue([
        doc(
          'درس مرجعي',
          `## الميزان الصرفي\n${words(600, 1000)}\n\n## القاعدة العامة\n${words(600, 2000)}`,
        ),
      ]);
      markdownMock.matchingGeneral.mockReturnValue([]);
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);

      const result = await rag.retrieve('ما الميزان الصرفي؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('كلمة1000');
      expect(result.contentWindow).not.toContain('القاعدة العامة');
      expect(result.contentWindow).not.toContain('كلمة2000');
    });
  });

  describe('scoreChunk', () => {
    const chunk = (heading: string, text: string): Chunk => ({
      id: 'c-001',
      heading,
      text,
      startPage: 1,
      endPage: 1,
      wordCount: text.split(/\s+/).length,
    });

    it('يمنح تطابق العنوان وزنًا أعلى من النص ويشترط مفردة جوهرية', () => {
      const weights = new Map([
        ['مبتدا', 2],
        ['مرفوع', 1.5],
      ]);
      const s = scoreChunk(
        chunk('المبتدأ', 'المبتدأ اسم مرفوع يقع أول الجملة.'),
        ['مبتدا', 'مرفوع'],
        weights,
      );
      expect(s.contentMatch).toBe(true);
      expect(s.score).toBeGreaterThan(0);
    });

    it('يرفض المقطع بلا أي تطابق مضموني', () => {
      const s = scoreChunk(
        chunk('التنوين', 'التنوين نون ساكنة تلحق آخر الاسم.'),
        ['مبتدا'],
        new Map(),
      );
      expect(s.score).toBe(0);
      expect(s.contentMatch).toBe(false);
    });
  });
});

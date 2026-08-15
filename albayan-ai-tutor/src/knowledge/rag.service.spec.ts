import { PrismaService } from '../prisma/prisma.service.js';
import {
  BookSection,
  GeneralBookDoc,
  MarkdownLoader,
} from './markdown-loader.js';
import { type Chunk } from './chunker.js';
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
          {
            id: 1n,
            lesson_id: 1n,
            title: 'المبتدأ',
            content:
              '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"مبتدأ مرفوع يقع أول الجملة."}]}]}',
          },
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

  describe('بوابة الكفاية والكسب الهامشي', () => {
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

    const lessonRow = (id: bigint, title: string) => ({
      id,
      title,
      summary: `${title} — ملخص`,
      learning_objectives: [],
    });

    const tipTap = (text: string) =>
      `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"${text}"}]}]}`;

    it('تكفي الطبقة 1 وحدها فلا تُبنى الطبقة 3 (بوابة كفاية)', async () => {
      const longText =
        'المبتدأ اسم مرفوع يقع أول الكلام، والخبر يتمم معنى المبتدأ، والمبتدأ والخبر معًا جملة مفيدة كاملة. '.repeat(
          2,
        );
      prismaMock.lessons.findMany.mockResolvedValue([
        lessonRow(1n, 'المبتدأ والخبر'),
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap(longText),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([
        {
          id: 'book1',
          title: 'المرجع العام',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 100,
          rootPath: '/books/b1',
          subjectIds: [5],
          gradeIds: [4],
          parts: [
            {
              file: 'p1.md',
              pages: [1, 50],
              chapter: null,
              sections: [
                {
                  id: 's1',
                  title: 'المبحث الأول المبْتَدَأُ',
                  kind: 'content',
                  page: 10,
                  concepts: ['مبتدأ', 'مرفوع'],
                },
              ],
            },
          ],
        },
      ]);
      markdownMock.readSection.mockImplementation(
        (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      const result = await rag.retrieve('ما المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة 1');
      expect(result.contentWindow).not.toContain('## الطبقة 3');
      expect(markdownMock.readSection).not.toHaveBeenCalled();
    });

    it('نقص التغطية الجوهرية يستدعي الطبقة 3 (بوابة كفاية تعمل)', async () => {
      // سؤال بمفردتين جوهرية: الطبقة 1 تغطي "المبتدأ" فقط دون "الخبر".
      prismaMock.lessons.findMany.mockResolvedValue([lessonRow(1n, 'المبتدأ')]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap('المبتدأ اسم مرفوع يقع أول الجملة'),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([
        {
          id: 'book2',
          title: 'كيف تتقن النحو؟',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 553,
          rootPath: '/books/b2',
          subjectIds: [5],
          gradeIds: [4],
          parts: [
            {
              file: 'p1.md',
              pages: [1, 60],
              chapter: null,
              sections: [
                {
                  id: 's1',
                  title: 'الْخَبَرِ وأنواعه',
                  kind: 'content',
                  page: 12,
                  concepts: ['خبر', 'مفرد'],
                },
              ],
            },
          ],
        },
      ]);
      markdownMock.readSection.mockImplementation(
        (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      const result = await rag.retrieve('ما المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة 1');
      expect(result.contentWindow).toContain('## الطبقة 3');
      expect(markdownMock.readSection).toHaveBeenCalled();
    });

    it('أغلفة الكسب الهامشي: يُستبعد مكرر الطبقة 1 ويُضم مقطع يضيف توكن جوهرية جديدًا', async () => {
      const longText =
        'المبتدأ اسم مرفوع يقع أول الكلام في الجملة الاسمية، وعلامة رفعه الضمة الظاهرة أو المقدرة. '.repeat(
          2,
        );
      prismaMock.lessons.findMany.mockResolvedValue([lessonRow(1n, 'المبتدأ')]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap(longText),
        },
      ]);
      // ملفان: الأول يعيد نص الطبقة 1 (لا توكن جديد) فيُستبعد؛
      // الثاني يضيف "الخبر" فيُضم.
      markdownMock.matching.mockReturnValue([
        doc(
          'مرجع مكرر',
          '## المبتدأ\nالمبتدأ اسم مرفوع يقع أول الكلام في الجملة الاسمية، وعلامة رفعه الضمة الظاهرة أو المقدرة.',
        ),
        doc(
          'مرجع مثري',
          '## الخبر\nالخبر يتمم معنى المبتدأ ويكمل الفائدة كاملة.',
        ),
      ]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      // مكرر الطبقة 1 مستبعد، والمثري بالخبر مضموم.
      expect(result.contentWindow).not.toContain('### مرجع مكرر —');
      expect(result.contentWindow).toContain('### مرجع مثري —');
      expect(result.contentWindow).toContain('الخبر يتمم معنى المبتدأ');
    });

    it('لا مصدر بلا نص فعلي داخل النافذة', async () => {
      prismaMock.lessons.findMany.mockResolvedValue([
        lessonRow(1n, 'المبتدأ'),
        lessonRow(2n, 'الفرق بين المبتدأ والخبر'),
      ]);
      // الدرس 2 لا فقرات له (أو لم تُستخرج) → لا مصدر.
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap('المبتدأ اسم مرفوع يقع أول الجملة'),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.sources).toEqual([{ lessonId: 1, lessonTitle: 'المبتدأ' }]);
      expect(result.contentWindow).not.toContain(
        '### الفرق بين المبتدأ والخبر',
      );
    });

    it('فشل DB في الطبقة 1 لا يفشل الطلب ويكمل من الطبقة 2', async () => {
      prismaMock.lessons.findMany.mockRejectedValue(new Error('db down'));
      prismaMock.paragraphs.findMany.mockResolvedValue([]);
      markdownMock.matching.mockReturnValue([
        doc(
          'درس المبتدأ والخبر',
          '## المبتدأ\nالمبتدأ اسم مرفوع يقع أول الجملة.',
        ),
      ]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة 2');
      expect(result.contentWindow).toContain('المبتدأ اسم مرفوع');
      expect(result.lessons).toEqual([]);
      expect(result.sources).toEqual([]);
    });

    it('سؤال بمقام جوهرية=2 ("الفرق بين المبتدأ والخبر") تُغطيهما الطبقة 1 فلا تُبنى L3', async () => {
      const longText =
        'المبتدأ اسم مرفوع يقع أول الكلام، والخبر يتمم معنى المبتدأ ويكمل الجملة المفيدة، والمبتدأ والخبر معًا أصل الجملة الاسمية. '.repeat(
          2,
        );
      prismaMock.lessons.findMany.mockResolvedValue([
        lessonRow(1n, 'المبتدأ والخبر'),
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap(longText),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما الفرق بين المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).toContain('## الطبقة 1');
      expect(result.contentWindow).not.toContain('## الطبقة 3');
      expect(markdownMock.readSection).not.toHaveBeenCalled();
    });

    it('سؤال MINOR-فقط ("ما الفرق بين؟") لا يمر البوابة ويُستدعى L3 دون قراءة قسم', async () => {
      prismaMock.lessons.findMany.mockResolvedValue([]);
      prismaMock.paragraphs.findMany.mockResolvedValue([]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([
        {
          id: 'book-minor',
          title: 'مرجع مقارنات عامة',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 100,
          rootPath: '/books/b-minor',
          subjectIds: [5],
          gradeIds: [4],
          parts: [
            {
              file: 'p1.md',
              pages: [1, 50],
              chapter: null,
              sections: [
                {
                  id: 's-minor',
                  title: 'الفرق بين كذا وكذا',
                  kind: 'content',
                  page: 10,
                  concepts: ['فرق', 'بين'],
                },
              ],
            },
          ],
        },
      ]);
      markdownMock.readSection.mockImplementation(
        (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
      );

      const result = await rag.retrieve('ما الفرق بين؟', {
        subjectId: 5,
        gradeId: null,
      });

      // يُستدعى L3 فعلًا (مطابقة عامة دُعيت مرتين: للأوزان ثم لبناء L3)،
      // لكن لا قسم يجتاز contentMatch بمقارنة MINOR وحدها.
      expect(markdownMock.matchingGeneral).toHaveBeenCalledTimes(2);
      expect(markdownMock.readSection).not.toHaveBeenCalled();
      expect(result.contentWindow).not.toContain('## الطبقة 3');
      expect(result.contentWindow).not.toContain('الفرق بين كذا وكذا');
    });

    it('env منعدم: يستقر على عتبة 0.6 — تغطية 0.5 تستدعي L3', async () => {
      const prevCoverage = process.env.RAG_SUFFICIENCY_COVERAGE;
      const prevChars = process.env.RAG_MIN_CONTENT_CHARS;
      delete process.env.RAG_SUFFICIENCY_COVERAGE;
      delete process.env.RAG_MIN_CONTENT_CHARS;
      try {
        rag = new RagService(
          prismaMock as unknown as PrismaService,
          markdownMock as unknown as MarkdownLoader,
        );
        const longText =
          'المبتدأ اسم مرفوع يقع أول الجملة، ويرفع بالضمة الظاهرة، والمبتدأ دائم التصدير في الجملة الاسمية المكتملة المعنى والفائدة. '.repeat(
            2,
          );
        prismaMock.lessons.findMany.mockResolvedValue([
          lessonRow(1n, 'المبتدأ'),
        ]);
        prismaMock.paragraphs.findMany.mockResolvedValue([
          {
            id: 1n,
            lesson_id: 1n,
            title: '',
            content: tipTap(longText),
          },
        ]);
        markdownMock.matching.mockReturnValue([]);
        markdownMock.matchingGeneral.mockReturnValue([
          {
            id: 'book-env1',
            title: 'كيف تتقن النحو؟',
            author: null,
            subjectName: 'اللغة العربية',
            totalPages: 553,
            rootPath: '/books/b-env1',
            subjectIds: [5],
            gradeIds: [4],
            parts: [
              {
                file: 'p1.md',
                pages: [1, 60],
                chapter: null,
                sections: [
                  {
                    id: 's1',
                    title: 'الْخَبَرِ وأنواعه',
                    kind: 'content',
                    page: 12,
                    concepts: ['خبر', 'مفرد'],
                  },
                ],
              },
            ],
          },
        ]);
        markdownMock.readSection.mockImplementation(
          (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
        );

        const result = await rag.retrieve('ما المبتدأ والخبر؟', {
          subjectId: 5,
          gradeId: null,
        });

        expect(result.contentWindow).toContain('## الطبقة 3');
      } finally {
        if (prevCoverage === undefined) {
          delete process.env.RAG_SUFFICIENCY_COVERAGE;
        } else {
          process.env.RAG_SUFFICIENCY_COVERAGE = prevCoverage;
        }
        if (prevChars === undefined) {
          delete process.env.RAG_MIN_CONTENT_CHARS;
        } else {
          process.env.RAG_MIN_CONTENT_CHARS = prevChars;
        }
      }
    });

    it('env مخصصة: RAG_SUFFICIENCY_COVERAGE=0.4 تُقرأ وتُطبَّق — تغطية 0.5 تكفي بلا L3', async () => {
      const prevCoverage = process.env.RAG_SUFFICIENCY_COVERAGE;
      const prevChars = process.env.RAG_MIN_CONTENT_CHARS;
      process.env.RAG_SUFFICIENCY_COVERAGE = '0.4';
      delete process.env.RAG_MIN_CONTENT_CHARS;
      try {
        rag = new RagService(
          prismaMock as unknown as PrismaService,
          markdownMock as unknown as MarkdownLoader,
        );
        const longText =
          'المبتدأ اسم مرفوع يقع أول الجملة، ويرفع بالضمة الظاهرة، والمبتدأ دائم التصدير في الجملة الاسمية المكتملة المعنى والفائدة. '.repeat(
            2,
          );
        prismaMock.lessons.findMany.mockResolvedValue([
          lessonRow(1n, 'المبتدأ'),
        ]);
        prismaMock.paragraphs.findMany.mockResolvedValue([
          {
            id: 1n,
            lesson_id: 1n,
            title: '',
            content: tipTap(longText),
          },
        ]);
        markdownMock.matching.mockReturnValue([]);
        markdownMock.matchingGeneral.mockReturnValue([
          {
            id: 'book-env2',
            title: 'كيف تتقن النحو؟',
            author: null,
            subjectName: 'اللغة العربية',
            totalPages: 553,
            rootPath: '/books/b-env2',
            subjectIds: [5],
            gradeIds: [4],
            parts: [
              {
                file: 'p1.md',
                pages: [1, 60],
                chapter: null,
                sections: [
                  {
                    id: 's1',
                    title: 'الْخَبَرِ وأنواعه',
                    kind: 'content',
                    page: 12,
                    concepts: ['خبر', 'مفرد'],
                  },
                ],
              },
            ],
          },
        ]);
        markdownMock.readSection.mockImplementation(
          (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
        );

        const result = await rag.retrieve('ما المبتدأ والخبر؟', {
          subjectId: 5,
          gradeId: null,
        });

        expect(result.contentWindow).not.toContain('## الطبقة 3');
        expect(markdownMock.readSection).not.toHaveBeenCalled();
      } finally {
        if (prevCoverage === undefined) {
          delete process.env.RAG_SUFFICIENCY_COVERAGE;
        } else {
          process.env.RAG_SUFFICIENCY_COVERAGE = prevCoverage;
        }
        if (prevChars === undefined) {
          delete process.env.RAG_MIN_CONTENT_CHARS;
        } else {
          process.env.RAG_MIN_CONTENT_CHARS = prevChars;
        }
      }
    });

    it('env منعدم: يستقر على سور 120 حرفًا — نافذة قصيرة تغطّي 2 من 3 تستدعي L3', async () => {
      const prevCoverage = process.env.RAG_SUFFICIENCY_COVERAGE;
      const prevChars = process.env.RAG_MIN_CONTENT_CHARS;
      delete process.env.RAG_SUFFICIENCY_COVERAGE;
      delete process.env.RAG_MIN_CONTENT_CHARS;
      try {
        rag = new RagService(
          prismaMock as unknown as PrismaService,
          markdownMock as unknown as MarkdownLoader,
        );
        // 3 توكنز جوهرية: المبتدأ+الخبر مغطيان من L1 (تغطية 0.667 ≥ 0.6)
        // لكن النافذة قصيرة (< 120) فيفشل السور وحده ويُستدعى L3 ليضيف "العلامة".
        prismaMock.lessons.findMany.mockResolvedValue([
          lessonRow(1n, 'المبتدأ والخبر'),
        ]);
        prismaMock.paragraphs.findMany.mockResolvedValue([
          {
            id: 1n,
            lesson_id: 1n,
            title: '',
            content: tipTap('المبتدأ والخبر جملة مفيدة'),
          },
        ]);
        markdownMock.matching.mockReturnValue([]);
        markdownMock.matchingGeneral.mockReturnValue([
          {
            id: 'book-env3',
            title: 'كيف تتقن النحو؟',
            author: null,
            subjectName: 'اللغة العربية',
            totalPages: 553,
            rootPath: '/books/b-env3',
            subjectIds: [5],
            gradeIds: [4],
            parts: [
              {
                file: 'p1.md',
                pages: [1, 60],
                chapter: null,
                sections: [
                  {
                    id: 's1',
                    title: 'علامات رفع الاسم والخبر',
                    kind: 'content',
                    page: 12,
                    concepts: ['علامة', 'رفع'],
                  },
                ],
              },
            ],
          },
        ]);
        markdownMock.readSection.mockImplementation(
          (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
        );

        const result = await rag.retrieve('ما علامة الخبر والمبتدأ؟', {
          subjectId: 5,
          gradeId: null,
        });

        expect(result.contentWindow).toContain('## الطبقة 3');
      } finally {
        if (prevCoverage === undefined) {
          delete process.env.RAG_SUFFICIENCY_COVERAGE;
        } else {
          process.env.RAG_SUFFICIENCY_COVERAGE = prevCoverage;
        }
        if (prevChars === undefined) {
          delete process.env.RAG_MIN_CONTENT_CHARS;
        } else {
          process.env.RAG_MIN_CONTENT_CHARS = prevChars;
        }
      }
    });

    it('env مخصصة: RAG_MIN_CONTENT_CHARS=50 تُقرأ وتُطبَّق — نفس النافذة القصيرة تكفي بلا L3', async () => {
      const prevCoverage = process.env.RAG_SUFFICIENCY_COVERAGE;
      const prevChars = process.env.RAG_MIN_CONTENT_CHARS;
      delete process.env.RAG_SUFFICIENCY_COVERAGE;
      process.env.RAG_MIN_CONTENT_CHARS = '50';
      try {
        rag = new RagService(
          prismaMock as unknown as PrismaService,
          markdownMock as unknown as MarkdownLoader,
        );
        prismaMock.lessons.findMany.mockResolvedValue([
          lessonRow(1n, 'المبتدأ والخبر'),
        ]);
        prismaMock.paragraphs.findMany.mockResolvedValue([
          {
            id: 1n,
            lesson_id: 1n,
            title: '',
            content: tipTap('المبتدأ والخبر جملة مفيدة'),
          },
        ]);
        markdownMock.matching.mockReturnValue([]);
        markdownMock.matchingGeneral.mockReturnValue([
          {
            id: 'book-env4',
            title: 'كيف تتقن النحو؟',
            author: null,
            subjectName: 'اللغة العربية',
            totalPages: 553,
            rootPath: '/books/b-env4',
            subjectIds: [5],
            gradeIds: [4],
            parts: [
              {
                file: 'p1.md',
                pages: [1, 60],
                chapter: null,
                sections: [
                  {
                    id: 's1',
                    title: 'علامات رفع الاسم والخبر',
                    kind: 'content',
                    page: 12,
                    concepts: ['علامة', 'رفع'],
                  },
                ],
              },
            ],
          },
        ]);
        markdownMock.readSection.mockImplementation(
          (_b: GeneralBookDoc, s: BookSection) => `محتوى ${s.title}`,
        );

        const result = await rag.retrieve('ما علامة الخبر والمبتدأ؟', {
          subjectId: 5,
          gradeId: null,
        });

        expect(result.contentWindow).not.toContain('## الطبقة 3');
        expect(markdownMock.readSection).not.toHaveBeenCalled();
      } finally {
        if (prevCoverage === undefined) {
          delete process.env.RAG_SUFFICIENCY_COVERAGE;
        } else {
          process.env.RAG_SUFFICIENCY_COVERAGE = prevCoverage;
        }
        if (prevChars === undefined) {
          delete process.env.RAG_MIN_CONTENT_CHARS;
        } else {
          process.env.RAG_MIN_CONTENT_CHARS = prevChars;
        }
      }
    });

    // ---- Baseline لسلوك scoreLesson الحالي (يُكتب ويُشغَّل قبل تعديل الأوزان) ----
    it('Baseline L1: مطابقة العنوان تعلو على مطابقة الملخص في ترتيب الدروس', async () => {
      prismaMock.lessons.findMany.mockResolvedValue([
        lessonRow(1n, 'المبتدأ والخبر'),
        {
          id: 2n,
          title: 'الجملة الاسمية',
          summary: 'نحدّد المبتدأ في الجملة الاسمية وركنيها',
          learning_objectives: [],
        },
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap('المبتدأ اسم مرفوع يقع أول الجملة الاسمية'),
        },
        {
          id: 2n,
          lesson_id: 2n,
          title: '',
          content: tipTap('الجملة الاسمية تبدأ بمبتدأ مرفوع'),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما المبتدأ؟', {
        subjectId: 5,
        gradeId: null,
      });

      // درس العنوان (الوزن 3) يسبق درس الملخص (الوزن 2) في ترتيب المصادر.
      expect(result.sources.map((s) => s.lessonTitle)).toEqual([
        'المبتدأ والخبر',
        'الجملة الاسمية',
      ]);
    });

    it('L1 بموحّد الأوزان: درس بعنوان MINOR-محور ("الفرق بين...") يُرفض ولا يدخل النافذة', async () => {
      // نفس سيناريو الـ Baseline الذي وثّق السلوك القديم (انتخاب درس MINOR-فقط).
      prismaMock.lessons.findMany.mockResolvedValue([
        lessonRow(1n, 'الفرق بين كذا وكذا'),
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap('نوضح الفرق بين كذا وكذا في هذا الدرس'),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما الفرق بين؟', {
        subjectId: 5,
        gradeId: null,
      });

      expect(result.contentWindow).not.toContain('### الفرق بين كذا وكذا');
      expect(result.lessons).toEqual([]);
    });

    it('درس المفردة النادرة يعلو على درس اللفظ العام في ترتيب L1 (idf)', async () => {
      // كتالوج من 4 دروس: "المبتدأ" يظهر في درس واحد (df=1 → وزن idf مرتفع)،
      // و"الخبر" يتكرر في 3 دروس (df=3 → وزن idf منخفض، يهبط إلى 0.5).
      // السؤال "ما المبتدأ والخبر؟" توكنز: المبتدا + والخبر.
      prismaMock.lessons.findMany.mockResolvedValue([
        lessonRow(1n, 'المبتدأ'),
        lessonRow(2n, 'الخبر'),
        lessonRow(3n, 'الخبر والفاعل'),
        lessonRow(4n, 'الخبر والمفعول'),
      ]);
      prismaMock.paragraphs.findMany.mockResolvedValue([
        {
          id: 1n,
          lesson_id: 1n,
          title: '',
          content: tipTap('المبتدأ اسم مرفوع يقع أول الجملة'),
        },
        {
          id: 2n,
          lesson_id: 2n,
          title: '',
          content: tipTap('الخبر يتمم معنى المبتدأ'),
        },
        {
          id: 3n,
          lesson_id: 3n,
          title: '',
          content: tipTap('الخبر والفاعل في الجملة الفعلية'),
        },
        {
          id: 4n,
          lesson_id: 4n,
          title: '',
          content: tipTap('الخبر والمفعول كليهما معمولان'),
        },
      ]);
      markdownMock.matching.mockReturnValue([]);
      markdownMock.matchingGeneral.mockReturnValue([]);

      const result = await rag.retrieve('ما المبتدأ والخبر؟', {
        subjectId: 5,
        gradeId: null,
      });

      const titles = result.sources.map((s) => s.lessonTitle);
      // بالموحّد: درس المبتدأ (نادر/أعلى idf) يترشح أولًا فوق دروس اللفظ العام.
      expect(titles[0]).toBe('المبتدأ');
      expect(titles.slice(1)).toContain('الخبر');
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

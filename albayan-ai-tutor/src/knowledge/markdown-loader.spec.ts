import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { LoggerService } from '../common/logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  GeneralBookDoc,
  MarkdownLoader,
  parseFrontMatter,
} from './markdown-loader.js';

describe('MarkdownLoader', () => {
  const prismaMock = {
    stages: { findUnique: jest.fn() },
    grades: { findFirst: jest.fn() },
    subjects: { findFirst: jest.fn(), findMany: jest.fn() },
  };

  const loggerMock: Partial<LoggerService> = {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  let loader: MarkdownLoader;

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new MarkdownLoader(
      prismaMock as unknown as PrismaService,
      loggerMock as unknown as LoggerService,
    );
  });

  describe('parseFrontMatter', () => {
    it('يفصل الفوقية عن النص ويحذف علامات الاقتباس', () => {
      const { meta, body } = parseFrontMatter(
        '---\ntitle: "المبتدأ والخبر"\ngrade: primary_4\nsubject: اللغة العربية\n---\n\n## الفقرة\nمحتوى',
      );
      expect(meta.title).toBe('المبتدأ والخبر');
      expect(meta.grade).toBe('primary_4');
      expect(meta.subject).toBe('اللغة العربية');
      expect(body).toContain('## الفقرة');
      expect(body).toContain('محتوى');
    });

    it('يعيد النص كاملًا إن لم يوجد front-matter', () => {
      const { meta, body } = parseFrontMatter('نص عادي\nبلا فوقية');
      expect(meta).toEqual({});
      expect(body).toBe('نص عادي\nبلا فوقية');
    });
  });

  describe('lookupIds', () => {
    it('يحل مسار المرحلة/الصف/المادة إلى معرفات قاعدة البيانات', async () => {
      prismaMock.stages.findUnique.mockResolvedValue({ id: 1n });
      prismaMock.grades.findFirst.mockResolvedValue({ id: 8n });
      prismaMock.subjects.findFirst.mockResolvedValue({ id: 5n });

      const ids = await (
        loader as unknown as {
          lookupIds: (doc: {
            stageKey: string;
            gradeKey: string;
            subjectName: string;
          }) => Promise<{ subjectId: number; gradeId: number } | null>;
        }
      ).lookupIds({
        stageKey: 'primary',
        gradeKey: 'primary_4',
        subjectName: 'اللغة العربية',
      });

      expect(ids).toEqual({ subjectId: 5, gradeId: 8 });
      expect(prismaMock.stages.findUnique).toHaveBeenCalledWith({
        where: { key: 'primary' },
        select: { id: true },
      });
      expect(prismaMock.grades.findFirst).toHaveBeenCalledWith({
        where: { stage_id: 1n, name: 'الصف الرابع الابتدائي' },
        select: { id: true },
      });
      expect(prismaMock.subjects.findFirst).toHaveBeenCalledWith({
        where: { grade_id: 8n, name: 'اللغة العربية' },
        select: { id: true },
      });
    });

    it('يعيد null عند غياب المرحلة', async () => {
      prismaMock.stages.findUnique.mockResolvedValue(null);
      const ids = await (
        loader as unknown as {
          lookupIds: (
            doc: unknown,
          ) => Promise<{ subjectId: number; gradeId: number } | null>;
        }
      ).lookupIds({});
      expect(ids).toBeNull();
    });
  });

  describe('matching', () => {
    it('يطابق بالمادة عندما تكون متاحة', async () => {
      prismaMock.stages.findUnique.mockResolvedValue({ id: 1n });
      prismaMock.grades.findFirst.mockResolvedValue({ id: 8n });
      prismaMock.subjects.findFirst.mockResolvedValue({ id: 5n });

      const raw = [
        {
          path: 'textbook/primary/primary_4/اللغة العربية/النحو/lesson.md',
          type: 'textbook' as const,
          stageKey: 'primary',
          gradeKey: 'primary_4',
          subjectName: 'اللغة العربية',
          courseName: 'النحو',
          title: 'المبتدأ والخبر',
          body: 'محتوى',
        },
      ];
      const docs = await (
        loader as unknown as {
          resolve: (rawDocs: typeof raw) => Promise<
            {
              subjectId: number | null;
              gradeId: number | null;
            }[]
          >;
        }
      ).resolve(raw);

      (
        loader as unknown as {
          docs: { subjectId: number | null; gradeId: number | null }[];
        }
      ).docs = docs;

      expect(loader.matching({ subjectId: 5, gradeId: 8 })).toHaveLength(1);
      expect(loader.matching({ subjectId: 99, gradeId: 8 })).toHaveLength(0);
    });

    it('يطابق بالصف عندما لا تتوفر المادة', () => {
      const docs = [
        { subjectId: null, gradeId: 8 },
        { subjectId: null, gradeId: 9 },
      ];
      (loader as unknown as { docs: typeof docs }).docs = docs;

      expect(loader.matching({ subjectId: null, gradeId: 8 })).toHaveLength(1);
      expect(loader.matching({ subjectId: null, gradeId: 9 })).toHaveLength(1);
      expect(loader.matching({ subjectId: null, gradeId: 10 })).toHaveLength(0);
    });
  });

  describe('matchingGeneral', () => {
    it('يرجّع الكتب العامة لمادة اللغة العربية مهما كان الصف', () => {
      const books: GeneralBookDoc[] = [
        {
          id: 'b1',
          title: 'كيف تتقن النحو؟',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 553,
          rootPath: '/books/nahw',
          parts: [],
          subjectIds: [5, 7],
          gradeIds: [4],
        },
      ];
      (loader as unknown as { generalBooks: typeof books }).generalBooks =
        books;

      expect(loader.matchingGeneral({ subjectId: 7 })).toHaveLength(1);
      expect(loader.matchingGeneral({ subjectId: 99 })).toHaveLength(0);
      expect(loader.matchingGeneral({})).toHaveLength(0);
    });

    it('يرجّع الكتب العامة بالصف حين لا يحدد الطالب مادة', () => {
      const books: GeneralBookDoc[] = [
        {
          id: 'b1',
          title: 'كيف تتقن النحو؟',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 553,
          rootPath: '/books/nahw',
          parts: [],
          subjectIds: [5, 7],
          gradeIds: [4],
        },
      ];
      (loader as unknown as { generalBooks: typeof books }).generalBooks =
        books;

      expect(loader.matchingGeneral({ gradeId: 4 })).toHaveLength(1);
      expect(loader.matchingGeneral({ gradeId: 9 })).toHaveLength(0);
    });

    it('يحل أسماء مواد الكتب العامة إلى معرفات ومعرفات الصفوف عبر Prisma', async () => {
      prismaMock.subjects.findMany.mockResolvedValue([
        { id: 5n, grade_id: 4n },
        { id: 7n, grade_id: 4n },
        { id: 9n, grade_id: 6n },
      ]);

      const books: GeneralBookDoc[] = [
        {
          id: 'b1',
          title: 'كيف تتقن النحو؟',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 553,
          rootPath: '/books/nahw',
          parts: [],
          subjectIds: [],
          gradeIds: [],
        },
      ];
      const resolved = await (
        loader as unknown as {
          resolveGeneralBooks: (
            books: GeneralBookDoc[],
          ) => Promise<GeneralBookDoc[]>;
        }
      ).resolveGeneralBooks(books);

      expect(resolved[0].subjectIds).toEqual([5, 7, 9]);
      expect(resolved[0].gradeIds).toEqual([4, 6]);
      expect(prismaMock.subjects.findMany).toHaveBeenCalledWith({
        where: { name: { in: ['اللغة العربية'] } },
        select: { id: true, grade_id: true },
      });
    });
  });

  describe('readSection', () => {
    it('يقرأ نصّ القسم من مرساة صفحته حتى المرساة التالية', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'readsec-'));
      try {
        fs.writeFileSync(
          path.join(dir, 'part-01.md'),
          [
            '# كيف تتقن النحو (1-40)',
            '',
            '## صفحة 10',
            '',
            'محتوى القسم الأول',
            '',
            '## صفحة 11',
            '',
            'محتوى القسم الثاني',
          ].join('\n'),
        );

        const book: GeneralBookDoc = {
          id: 'b1',
          title: 'كيف تتقن النحو؟',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 553,
          rootPath: dir,
          parts: [
            {
              file: 'part-01.md',
              pages: [1, 40],
              chapter: null,
              sections: [],
            },
          ],
          subjectIds: [],
          gradeIds: [],
        };

        const text = loader.readSection(book, {
          id: 'c001',
          title: 'الكلمة',
          kind: 'content',
          page: 10,
          concepts: [],
        });

        expect(text).toContain('محتوى القسم الأول');
        expect(text).not.toContain('محتوى القسم الثاني');
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    it('يعيد null لصفحة بلا مرساة أو جزء غير معروف', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'readsec-'));
      try {
        fs.writeFileSync(
          path.join(dir, 'part-01.md'),
          ['## صفحة 1', '', 'محتوى'].join('\n'),
        );

        const book: GeneralBookDoc = {
          id: 'b1',
          title: 'كتاب',
          author: null,
          subjectName: 'اللغة العربية',
          totalPages: 100,
          rootPath: dir,
          parts: [
            {
              file: 'part-01.md',
              pages: [1, 40],
              chapter: null,
              sections: [],
            },
          ],
          subjectIds: [],
          gradeIds: [],
        };

        expect(
          loader.readSection(book, {
            id: 'c999',
            title: 'مفقود',
            kind: 'content',
            page: 999,
            concepts: [],
          }),
        ).toBeNull();

        const outOfPart: GeneralBookDoc = {
          ...book,
          parts: [
            {
              file: 'part-02.md',
              pages: [41, 80],
              chapter: null,
              sections: [],
            },
          ],
        };
        expect(
          loader.readSection(outOfPart, {
            id: 'c002',
            title: 'بعيد',
            kind: 'content',
            page: 10,
            concepts: [],
          }),
        ).toBeNull();
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });
});

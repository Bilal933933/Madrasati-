import { PrismaService } from '../prisma/prisma.service.js';
import { MarkdownLoader, parseFrontMatter } from './markdown-loader.js';

describe('MarkdownLoader', () => {
  const prismaMock = {
    stages: { findUnique: jest.fn() },
    grades: { findFirst: jest.fn() },
    subjects: { findFirst: jest.fn() },
  };

  let loader: MarkdownLoader;

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new MarkdownLoader(prismaMock as unknown as PrismaService);
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
});

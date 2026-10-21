import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProgressService } from './progress.service.js';

describe('ProgressService', () => {
  let service: ProgressService;
  const prismaMock = {
    lesson_completions: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(ProgressService);
  });

  describe('completedCount', () => {
    it('يستخدم معرّف الطالب فقط', async () => {
      prismaMock.lesson_completions.count.mockResolvedValue(45);
      await expect(service.completedCount(42)).resolves.toBe(45);
      expect(prismaMock.lesson_completions.count).toHaveBeenCalledWith({
        where: { user_id: 42 },
      });
    });
  });

  describe('dailyStreak', () => {
    function day(offset: number): Date {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      return d;
    }

    it('يحسب الأيام المتتالية فقط', async () => {
      prismaMock.lesson_completions.findMany.mockResolvedValue([
        { completed_at: day(0) },
        { completed_at: day(1) },
        { completed_at: day(2) },
        { completed_at: day(4) },
      ]);
      await expect(service.dailyStreak(42)).resolves.toBe(3);
    });
  });

  describe('perSubject', () => {
    it('يجمع الإكمالات لكل مادة ويحوّل bigint إلى number', async () => {
      prismaMock.lesson_completions.findMany.mockResolvedValue([
        {
          lessons: {
            courses: { subject_id: 5n, subjects: { name: 'الأحياء' } },
          },
        },
        {
          lessons: {
            courses: { subject_id: 5n, subjects: { name: 'الأحياء' } },
          },
        },
        {
          lessons: {
            courses: { subject_id: 3n, subjects: { name: 'الرياضيات' } },
          },
        },
      ]);

      await expect(service.perSubject(42)).resolves.toEqual([
        { subjectId: 5, subjectName: 'الأحياء', completed: 2 },
        { subjectId: 3, subjectName: 'الرياضيات', completed: 1 },
      ]);
    });
  });
});

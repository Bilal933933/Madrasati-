import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { PerformanceService } from './performance.service.js';

describe('PerformanceService', () => {
  let service: PerformanceService;
  const prismaMock = {
    exam_attempts: { findMany: jest.fn() },
    exam_attempt_questions: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PerformanceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(PerformanceService);
  });

  describe('summary', () => {
    it('يعدّ الناجحين ويحسب المتوسط والأضعف', async () => {
      prismaMock.exam_attempts.findMany.mockResolvedValue([
        { score_percentage: 80, passed: true, exam_blueprints: { exam_type: 'lesson' } },
        { score_percentage: 60, passed: true, exam_blueprints: { exam_type: 'lesson' } },
        { score_percentage: 40, passed: false, exam_blueprints: { exam_type: 'monthly' } },
      ]);

      const result = await service.summary(42);
      expect(result.attemptsCount).toBe(3);
      expect(result.passedCount).toBe(2);
      expect(result.averageScore).toBe(60);
      expect(result.bestScore).toBe(80);
      expect(result.weakestExamType).toBe('monthly');
      expect(prismaMock.exam_attempts.findMany).toHaveBeenCalledWith({
        where: { user_id: 42, status: 'completed' },
        select: expect.anything(),
      });
    });

    it('يرجع قيمًا فارغة عند عدم وجود محاولات', async () => {
      prismaMock.exam_attempts.findMany.mockResolvedValue([]);
      await expect(service.summary(42)).resolves.toEqual({
        attemptsCount: 0,
        passedCount: 0,
        averageScore: null,
        bestScore: null,
        weakestExamType: null,
      });
    });
  });

  describe('weakAreas', () => {
    it('يجمع أخطاء الطالب على مستوى الدرس بالترتيب', async () => {
      prismaMock.exam_attempt_questions.findMany.mockResolvedValue([
        { bank_questions: { lessons: { id: 7n, title: 'الوراثة' } } },
        { bank_questions: { lessons: { id: 7n, title: 'الوراثة' } } },
        { bank_questions: { lessons: { id: 9n, title: 'التطور' } } },
        { bank_questions: null },
      ]);

      const result = await service.weakAreas(42, 5);
      expect(result).toEqual([
        { lessonId: 7, lessonTitle: 'الوراثة', errorCount: 2 },
        { lessonId: 9, lessonTitle: 'التطور', errorCount: 1 },
      ]);
      expect(prismaMock.exam_attempt_questions.findMany).toHaveBeenCalledWith({
        where: {
          is_correct: false,
          exam_attempts: { user_id: 42, status: 'completed' },
        },
        select: expect.anything(),
      });
    });
  });
});
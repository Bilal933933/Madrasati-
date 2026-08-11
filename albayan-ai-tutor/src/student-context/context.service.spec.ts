import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StudentContext } from './context.types.js';
import { ContextService } from './context.service.js';
import { PerformanceService } from './performance.service.js';
import { ProgressService } from './progress.service.js';

describe('ContextService', () => {
  let service: ContextService;

  const prismaMock = {
    users: { findUnique: jest.fn() },
    student_profiles: { findUnique: jest.fn() },
    user_achievements: { findMany: jest.fn() },
  };

  const progressMock = {
    completedCount: jest.fn(),
    perSubject: jest.fn(),
    lastLesson: jest.fn(),
    dailyStreak: jest.fn(),
  };

  const performanceMock = {
    summary: jest.fn(),
    weakAreas: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContextService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProgressService, useValue: progressMock },
        { provide: PerformanceService, useValue: performanceMock },
      ],
    }).compile();

    service = moduleRef.get(ContextService);
  });

  it('يبني صورة الطالب من مصادر متوازية', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 42n,
      name: 'أحمد محمد',
      email: 'ahmed@school.com',
      role: 'student',
    });
    prismaMock.student_profiles.findUnique.mockResolvedValue({
      grade_id: 8n,
      semester_id: 2n,
      last_subject_id: 5n,
      grades: { name: 'ثالث ثانوي', stages: { name: 'ثانوي' } },
      semesters: { name: 'الفصل الثاني' },
      subjects: { name: 'الأحياء' },
    });
    prismaMock.user_achievements.findMany.mockResolvedValue([
      {
        unlocked_at: new Date('2024-02-05T12:00:00Z'),
        achievements: { id: 1n, title: 'متعلّم منظم' },
      },
    ]);

    progressMock.completedCount.mockResolvedValue(45);
    progressMock.perSubject.mockResolvedValue([
      { subjectId: 5, subjectName: 'الأحياء', completed: 30 },
    ]);
    progressMock.lastLesson.mockResolvedValue({
      id: 15,
      title: 'التمثيل الضوئي',
      courseName: 'النبات',
    });
    progressMock.dailyStreak.mockResolvedValue(5);

    performanceMock.summary.mockResolvedValue({
      attemptsCount: 10,
      passedCount: 8,
      averageScore: 76.5,
      bestScore: 95,
      weakestExamType: 'lesson',
    });
    performanceMock.weakAreas.mockResolvedValue([
      { lessonId: 7, lessonTitle: 'الوراثة', errorCount: 3 },
    ]);

    const context: StudentContext = await service.getStudentContext(42);

    expect(context.student.id).toBe(42);
    expect(context.placement.gradeName).toBe('ثالث ثانوي');
    expect(context.placement.stageName).toBe('ثانوي');
    expect(context.placement.currentSubjectName).toBe('الأحياء');
    expect(context.progress.completedCount).toBe(45);
    expect(context.performance.averageScore).toBe(76.5);
    expect(context.weakAreas[0].lessonTitle).toBe('الوراثة');
    expect(context.achievements[0].title).toBe('متعلّم منظم');
  });

  it('يرفض غير الطالب', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 1n,
      name: 'مشرف',
      email: 'admin@school.com',
      role: 'admin',
    });
    prismaMock.student_profiles.findUnique.mockResolvedValue(null);
    prismaMock.user_achievements.findMany.mockResolvedValue([]);
    progressMock.completedCount.mockResolvedValue(0);
    progressMock.perSubject.mockResolvedValue([]);
    progressMock.lastLesson.mockResolvedValue(null);
    progressMock.dailyStreak.mockResolvedValue(0);
    performanceMock.summary.mockResolvedValue({
      attemptsCount: 0,
      passedCount: 0,
      averageScore: null,
      bestScore: null,
      weakestExamType: null,
    });
    performanceMock.weakAreas.mockResolvedValue([]);

    await expect(service.getStudentContext(1)).rejects.toThrow('Student not found');
  });
});
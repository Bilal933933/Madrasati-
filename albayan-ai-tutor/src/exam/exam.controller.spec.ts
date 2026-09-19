import { Test, TestingModule } from '@nestjs/testing';
import { ExamController } from './exam.controller.js';
import { AiGradingService } from './ai-grading.service.js';
import { InternalServiceGuard } from '../auth/internal-service.guard.js';
import { CustomValidationPipe } from '../common/pipes/validation.pipe.js';
import type { GradeResult } from './exam.types.js';

const mockAiGradingService = {
  gradeMultiple: jest.fn(),
};

describe('ExamController', () => {
  let controller: ExamController;
  let service: typeof mockAiGradingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [
        { provide: AiGradingService, useValue: mockAiGradingService },
      ],
    })
      .overrideGuard(InternalServiceGuard)
      .useValue({ canActivate: () => true })
      .overridePipe(CustomValidationPipe)
      .useValue({ transform: (value) => value })
      .compile();

    controller = module.get<ExamController>(ExamController);
    service = module.get(AiGradingService);
  });

  describe('grade', () => {
    it('should call AiGradingService.gradeMultiple and return results', async () => {
      const mockResults: GradeResult[] = [
        {
          questionId: 1,
          type: 'short_answer',
          status: 'graded',
          score: 1,
          aiGrade: { correct: true, confidence: 0.9, feedback: 'ممتاز' },
        },
        {
          questionId: 2,
          type: 'essay',
          status: 'graded',
          score: 0.85,
          aiGrade: {
            score_percent: 85,
            criteria: [],
            feedback: 'جيد',
            strengths: [],
            improvements: [],
          },
        },
      ];

      service.gradeMultiple.mockResolvedValue(mockResults);

      const dto = {
        questions: [
          { questionId: 1, type: 'short_answer', question: 'س1', studentAnswer: 'ج1' },
          { questionId: 2, type: 'essay', question: 'س2', studentAnswer: 'ج2' },
        ],
      };

      const result = await controller.grade(dto);

      expect(service.gradeMultiple).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ results: mockResults });
    });

    it('should return empty results array when service returns empty', async () => {
      service.gradeMultiple.mockResolvedValue([]);

      const result = await controller.grade({ questions: [] });

      expect(result).toEqual({ results: [] });
    });

    it('should propagate errors from service', async () => {
      service.gradeMultiple.mockRejectedValue(new Error('Service error'));

      const dto = { questions: [{ questionId: 1, type: 'short_answer', question: 'س1', studentAnswer: 'ج1' }] };

      await expect(controller.grade(dto)).rejects.toThrow('Service error');
    });
  });
});
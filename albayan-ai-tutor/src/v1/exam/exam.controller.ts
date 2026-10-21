import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { InternalServiceGuard } from '../auth/internal-service.guard.js';
import { CustomValidationPipe } from '../common/pipes/validation.pipe.js';
import { AiGradingService } from './ai-grading.service.js';
import { GradeExamDto } from './dto/grade-exam.dto.js';
import type { GradeResult } from './exam.types.js';

/**
 * نقطة تصحيح الأسئلة النصية — تُستدعى من Laravel فقط (محمية بـ InternalServiceGuard).
 * `POST /api/exam/grade` يستقبل دفعة أسئلة ويعيد نتيجة مستقلة لكل سؤال.
 */
@Controller('api/exam')
@UseGuards(InternalServiceGuard)
@UsePipes(CustomValidationPipe)
export class ExamController {
  constructor(private readonly grading: AiGradingService) {}

  @Post('grade')
  async grade(@Body() dto: GradeExamDto): Promise<{ results: GradeResult[] }> {
    const results = await this.grading.gradeMultiple(dto);
    return { results };
  }
}
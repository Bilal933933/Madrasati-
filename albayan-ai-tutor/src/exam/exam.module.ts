import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { AiGradingService } from './ai-grading.service.js';
import { ExamController } from './exam.controller.js';

/**
 * وحدة تصحيح الأسئلة النصية بالمساعد الذكي:
 * - تعتمد على GeminiService (AiModule) للمخرجات المنظمة.
 * - تعتمد على RagService (KnowledgeModule) كاحتياط سياق إن لم يمرَّر نص.
 */
@Module({
  imports: [AiModule, KnowledgeModule],
  controllers: [ExamController],
  providers: [AiGradingService],
  exports: [AiGradingService],
})
export class ExamModule {}
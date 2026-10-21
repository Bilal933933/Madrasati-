import { Module } from '@nestjs/common';
import { AiModule } from '../v1/ai/ai.module.js';
import { KnowledgeModule } from '../v1/knowledge/knowledge.module.js';
import { StudentContextModule } from '../v1/student-context/student-context.module.js';
import { ThreadsModule } from '../v1/threads/threads.module.js';
import { SmartAssistantController } from './smart-assistant.controller.js';
import { SmartAssistantGateway } from './smart-assistant.gateway.js';
import { SmartAssistantService } from './smart-assistant.service.js';

/**
 * موديول المساعد الثاني (v2) — ملفاته الخاصة فقط، والبنية المشتركة من v1.
 * يُسجَّل داخل v2.module (حزمة الإصدار) لا في الرئيسي مباشرة.
 */
@Module({
  imports: [StudentContextModule, KnowledgeModule, AiModule, ThreadsModule],
  controllers: [SmartAssistantController],
  providers: [SmartAssistantService, SmartAssistantGateway],
  exports: [SmartAssistantService],
})
export class SmartAssistantModule {}

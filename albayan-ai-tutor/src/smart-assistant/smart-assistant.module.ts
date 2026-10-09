import { Module } from '@nestjs/common';
import { SmartAssistantController } from './smart-assistant.controller.js';
import { SmartAssistantService } from './smart-assistant.service.js';

/**
 * موديول المساعد الذكي — مستقل تمامًا عن ChatModule/AiModule.
 * يُسجَّل في AppModule إضافيًا فقط دون تعديل أي موديول قائم.
 */
@Module({
  controllers: [SmartAssistantController],
  providers: [SmartAssistantService],
  exports: [SmartAssistantService],
})
export class SmartAssistantModule {}

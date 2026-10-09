import { Controller, Get } from '@nestjs/common';
import {
  SmartAssistantService,
  type SmartAssistantStatus,
} from './smart-assistant.service.js';

/**
 * نقطة فحص عامة للمساعد الذكي الجديد — لا تتطلب مصادقة عمدًا
 * (حالة هيكل فقط، بلا بيانات شخصية) حتى لا نكسر أي تدفق قائم.
 */
@Controller('api/smart-assistant')
export class SmartAssistantController {
  constructor(private readonly assistant: SmartAssistantService) {}

  @Get('status')
  status(): SmartAssistantStatus {
    return this.assistant.status();
  }
}

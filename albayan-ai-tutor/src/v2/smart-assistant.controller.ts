import { Controller, Get } from '@nestjs/common';
import {
  SmartAssistantService,
  type SmartAssistantStatus,
} from './smart-assistant.service.js';

/** استجابة نجاح موحدة لنقاط REST — نفس فلسفة response-complete في السوكت. */
export interface SmartAssistantStatusResponse {
  success: true;
  data: SmartAssistantStatus;
}

/**
 * نقطة فحص عامة للمساعد الذكي الجديد — لا تتطلب مصادقة عمدًا
 * (حالة فقط، بلا بيانات شخصية) حتى لا نكسر أي تدفق قائم.
 * الأخطاء يلتقطها الفلتر العام تلقائيًا بشكل موحد.
 */
@Controller('api/smart-assistant')
export class SmartAssistantController {
  constructor(private readonly assistant: SmartAssistantService) {}

  @Get('status')
  status(): SmartAssistantStatusResponse {
    return { success: true, data: this.assistant.status() };
  }
}

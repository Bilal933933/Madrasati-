import { Injectable } from '@nestjs/common';

export interface SmartAssistantStatus {
  name: string;
  status: 'skeleton';
  description: string;
}

/**
 * المساعد الذكي — خدمة جديدة بجانب ChatService الحالي (لا تمسه).
 * حاليًا هيكل فقط: كل منطق الـ router/studentGraph/adminDeepAgent سيُبنى هنا لاحقًا.
 */
@Injectable()
export class SmartAssistantService {
  status(): SmartAssistantStatus {
    return {
      name: 'المساعد الذكي',
      status: 'skeleton',
      description: 'هيكل جديد — المنطق الحالي في ChatService يعمل كما هو.',
    };
  }
}

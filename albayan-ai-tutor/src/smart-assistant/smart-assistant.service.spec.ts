import { SmartAssistantService } from './smart-assistant.service.js';

describe('SmartAssistantService (skeleton)', () => {
  it('يعيد حالة الهيكل دون المساس بالخدمة الحالية', () => {
    const service = new SmartAssistantService();
    expect(service.status()).toEqual({
      name: 'المساعد الذكي',
      status: 'skeleton',
      description: 'هيكل جديد — المنطق الحالي في ChatService يعمل كما هو.',
    });
  });
});

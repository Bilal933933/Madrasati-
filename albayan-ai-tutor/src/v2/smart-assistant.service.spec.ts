import { AppError } from '../v1/common/errors/app-error.js';
import { SmartAssistantService } from './smart-assistant.service.js';

function createService(): SmartAssistantService {
  const contextService = { getStudentContext: jest.fn() };
  const rag = { retrieve: jest.fn() };
  const promptBuilder = { build: jest.fn() };
  const gemini = { stream: jest.fn() };
  const tickets = { verify: jest.fn() };
  const threads = {
    getRecentMessages: jest.fn(),
    findOwnedThread: jest.fn(),
    setTitleFromQuestion: jest.fn(),
    saveMessage: jest.fn(),
  };
  return new SmartAssistantService(
    contextService as never,
    rag as never,
    promptBuilder,
    gemini as never,
    tickets as never,
    threads as never,
  );
}

describe('SmartAssistantService (base)', () => {
  it('يعيد حالة الجاهزية بالشكل الموحد', () => {
    const service = createService();
    expect(service.status()).toEqual({
      name: 'المساعد الذكي',
      status: 'ready',
      description: 'بنية أساسية جاهزة — نفس مسار ChatService.',
    });
  });

  it('يرمي حد المعدل بعد 20 سؤالًا في الدقيقة', () => {
    const service = createService();
    for (let i = 0; i < 20; i += 1) {
      service.assertWithinLimit(7);
    }
    expect(() => service.assertWithinLimit(7)).toThrow(AppError);
  });
});

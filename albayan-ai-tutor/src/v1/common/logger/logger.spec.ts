import type { Logger } from 'winston';
import { LoggerService } from './logger.service.js';

describe('LoggerService', () => {
  const context = { event: 'test_event', userId: 7, threadId: 3 };

  const createService = () => {
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    const service = new LoggerService(logger as unknown as Logger);
    return { service, logger };
  };

  it('ينشر info مع السياق والبيانات', () => {
    const { service, logger } = createService();
    service.info(context, 'msg', { questionLength: 5 });
    expect(logger.info).toHaveBeenCalledWith(
      'msg',
      expect.objectContaining({
        event: 'test_event',
        userId: 7,
        threadId: 3,
        data: { questionLength: 5 },
      }),
    );
  });

  it('يحذف مفتاح data إن لم تُمرر بيانات', () => {
    const { service, logger } = createService();
    service.info(context, 'msg');
    expect(logger.info).toHaveBeenCalledWith(
      'msg',
      expect.not.objectContaining({ data: undefined }),
    );
  });

  it('يسجل الخطأ مع رسالته و Stack', () => {
    const { service, logger } = createService();
    const err = new Error('boom');
    service.error(context, 'failed', err, { statusCode: 500 });
    expect(logger.error).toHaveBeenCalledWith(
      'failed',
      expect.objectContaining({
        event: 'test_event',
        errorMessage: 'boom',
        stack: expect.any(String) as string,
        details: { statusCode: 500 },
      }),
    );
  });

  it('يُسجل تفاصيل الأخطاء غير القياسية كنص', () => {
    const { service, logger } = createService();
    service.error(context, 'oops', 'string-error');
    expect(logger.error).toHaveBeenCalledWith(
      'oops',
      expect.objectContaining({ errorDetail: "'string-error'" }),
    );
  });

  it('يسجل العمليات السريعة (<500ms) عند مستوى debug', () => {
    const { service, logger } = createService();
    service.performance(context, {
      operation: 'rag.retrieveKnowledge',
      duration: 12,
      status: 'success',
    });
    expect(logger.debug).toHaveBeenCalledWith(
      'Performance: rag.retrieveKnowledge',
      expect.objectContaining({
        operation: 'rag.retrieveKnowledge',
        duration: 12,
        status: 'success',
        event: 'test_event',
      }),
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('يسجل العمليات الملحوظة (>500ms) عند مستوى info', () => {
    const { service, logger } = createService();
    service.performance(context, {
      operation: 'rag.retrieveKnowledge',
      duration: 600,
      status: 'success',
    });
    expect(logger.info).toHaveBeenCalledWith(
      'Performance: rag.retrieveKnowledge',
      expect.objectContaining({ duration: 600 }),
    );
  });

  it('يسجل العمليات البطيئة (>2000ms) عند مستوى warn', () => {
    const { service, logger } = createService();
    service.performance(context, {
      operation: 'rag.retrieveKnowledge',
      duration: 5000,
      status: 'failure',
      itemsProcessed: 0,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'Performance: rag.retrieveKnowledge',
      expect.objectContaining({ duration: 5000, itemsProcessed: 0 }),
    );
  });
});

import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { AiUpstreamError } from './ai-upstream-error.js';
import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';
import {
  codeOf,
  messageOf,
  resolveErrorBody,
  statusOf,
} from './global-exception.filter.js';
import { ValidationError } from './validation-error.js';

describe('errors', () => {
  describe('AppError', () => {
    it('يحمل code/status/userMessage/details', () => {
      const err = new AppError({
        code: ErrorCode.RATE_LIMIT,
        status: 429,
        userMessage: 'لقد أرسلت عددًا كبيرًا من الأسئلة.',
        details: 'rate limit 20/60s exceeded',
      });

      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe(ErrorCode.RATE_LIMIT);
      expect(err.status).toBe(429);
      expect(err.userMessage).toBe('لقد أرسلت عددًا كبيرًا من الأسئلة.');
      expect(err.details).toBe('rate limit 20/60s exceeded');
    });
  });

  describe('ValidationError', () => {
    it('يثبّت الكود والحالة 400', () => {
      const err = new ValidationError('السؤال فارغ أو قصير جدًا.');
      expect(err.code).toBe(ErrorCode.VALIDATION);
      expect(err.status).toBe(400);
      expect(err.userMessage).toBe('السؤال فارغ أو قصير جدًا.');
    });
  });

  describe('AiUpstreamError', () => {
    it('يثبّت الكود والحالة 503 ويحفظ السبب الداخلي فقط', () => {
      const original = new Error('gemini rate limit reached');
      const err = new AiUpstreamError(original);

      expect(err.code).toBe(ErrorCode.AI_UPSTREAM);
      expect(err.status).toBe(503);
      expect(err.details).toBe('gemini rate limit reached');
    });
  });

  describe('resolveErrorBody', () => {
    it('يُرقّع AppError كـ NOT_FOUND عربي', () => {
      const err = new AppError({
        code: ErrorCode.NOT_FOUND,
        status: 404,
        userMessage: 'لا يوجد محادثة بهذا المعرف.',
      });

      expect(resolveErrorBody(err)).toEqual({
        success: false,
        statusCode: 404,
        error: ErrorCode.NOT_FOUND,
        code: ErrorCode.NOT_FOUND,
        message: 'لا يوجد محادثة بهذا المعرف.',
      });
    });

    it('يمرّر code المضمّن في HttpException (TOKEN_EXPIRED)', () => {
      const err = new UnauthorizedException({ code: 'TOKEN_EXPIRED' });
      expect(statusOf(err)).toBe(401);
      expect(codeOf(err)).toBe(ErrorCode.TOKEN_EXPIRED);
      expect(messageOf(err)).toBe(
        'مصادقة المعلم الذكي مرفوضة. أعد تسجيل الدخول.',
      );
    });

    it('يُدرك NotFoundException المخزوني ويُعرب رسالته', () => {
      const err = new NotFoundException('Thread not found');
      expect(resolveErrorBody(err)).toEqual({
        success: false,
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'المورد المطلوب غير موجود.',
        error: 'Not Found',
      });
    });

    it('يحوّل الخطأ الخام إلى INTERNAL عام دون تسريب رسالته', () => {
      const raw = new Error('SENSITIVE_INTERNAL_GEMINI_DETAILS');
      expect(resolveErrorBody(raw)).toEqual({
        success: false,
        statusCode: 500,
        code: ErrorCode.INTERNAL,
        message: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
        error: 'Internal Server Error',
      });
      expect(statusOf('not-an-error')).toBe(500);
    });

    it('يمرّر ThrottlerException (429) عبر الفلتر إلى RATE_LIMIT عربي', () => {
      const err = new ThrottlerException('Too Many Requests');
      expect(resolveErrorBody(err)).toEqual({
        success: false,
        statusCode: 429,
        error: 'ThrottlerException',
        code: ErrorCode.RATE_LIMIT,
        message: 'تم تجاوز عدد الطلبات المسموح. حاول بعد قليل.',
      });
    });
  });
});

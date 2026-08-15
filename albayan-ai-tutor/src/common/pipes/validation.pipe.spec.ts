import 'reflect-metadata';
import type { ArgumentMetadata } from '@nestjs/common';
import { SendQuestionDto } from '../../chat/dto/send-question.dto.js';
import { AppError } from '../errors/app-error.js';
import { ErrorCode } from '../errors/error-codes.js';
import { CreateThreadDto } from '../../threads/dto/create-thread.dto.js';
import { CustomValidationPipe } from './validation.pipe.js';

function bodyOf(metatype: unknown): ArgumentMetadata {
  return {
    type: 'body',
    metatype: metatype as never,
    data: undefined,
  };
}

describe('CustomValidationPipe', () => {
  const pipe = new CustomValidationPipe();

  it('يحوّل الأرقام النصية ويقتطع المسافات من السؤال', async () => {
    const result = (await pipe.transform(
      { threadId: '5', question: '  ما هو التمثيل الضوئي؟  ' },
      bodyOf(SendQuestionDto),
    )) as SendQuestionDto;

    expect(result.threadId).toBe(5);
    expect(result.question).toBe('ما هو التمثيل الضوئي؟');
  });

  it('يرفض threadId غير رقمي برمز VALIDATION', async () => {
    await expect(
      pipe.transform(
        { threadId: 'abc', question: 'سؤال صالح' },
        bodyOf(SendQuestionDto),
      ),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION, status: 400 });
  });

  it('يرفض سؤالاً من مسافات فقط بعد القص', async () => {
    await expect(
      pipe.transform({ threadId: 1, question: '   ' }, bodyOf(SendQuestionDto)),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION });
  });

  it('يرفض سؤالاً أطول من 2000 حرف', async () => {
    await expect(
      pipe.transform(
        { threadId: 1, question: 'س'.repeat(2001) },
        bodyOf(SendQuestionDto),
      ),
    ).rejects.toThrow(AppError);
  });

  it('يتجاهل الحقول غير المعروفة (whitelist)', async () => {
    const result = (await pipe.transform(
      { subjectId: 3, lessonId: 9, injected: 'x' },
      bodyOf(CreateThreadDto),
    )) as CreateThreadDto & Record<string, unknown>;

    expect(result.subjectId).toBe(3);
    expect(result.lessonId).toBe(9);
    expect(result.injected).toBeUndefined();
  });

  it('يتجاوز أنواع metadata غير body دون تحقق', async () => {
    const value = { raw: true };
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: SendQuestionDto as never,
      data: 'id',
    };
    await expect(pipe.transform(value, metadata)).resolves.toBe(value);
  });
});

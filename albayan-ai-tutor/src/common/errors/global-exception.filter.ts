import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Socket } from 'socket.io';
import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';

/** شكل الخطأ الموحّد لأجسام استجابات HTTP. */
export interface ErrorBody {
  success: boolean;
  statusCode: number;
  error: string;
  code: string;
  message: string;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'البيانات المرسلة غير صحيحة.',
  401: 'مصادقة المعلم الذكي مرفوضة. أعد تسجيل الدخول.',
  403: 'ليست لديك صلاحية للوصول إلى هذا المورد.',
  404: 'المورد المطلوب غير موجود.',
  429: 'تم تجاوز عدد الطلبات المسموح. حاول بعد قليل.',
  503: 'خدمة المعلم الذكي غير متاحة حاليًا. حاول مجددًا.',
};

const FALLBACK_MESSAGE = 'حدث خطأ غير متوقع. حاول مرة أخرى.';

export function statusOf(error: unknown): number {
  if (error instanceof AppError) return error.status;
  if (error instanceof HttpException) return error.getStatus();
  return 500;
}

export function codeOf(error: unknown): string {
  if (error instanceof AppError) return error.code;
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === 'object' && response !== null) {
      const embedded = (response as { code?: unknown }).code;
      if (typeof embedded === 'string') return embedded;
    }
  }
  const status = statusOf(error);
  switch (status) {
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 429:
      return ErrorCode.RATE_LIMIT;
    case 503:
      return ErrorCode.AI_UPSTREAM;
    default:
      return ErrorCode.INTERNAL;
  }
}

export function messageOf(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  return STATUS_MESSAGES[statusOf(error)] ?? FALLBACK_MESSAGE;
}

function errorLabel(error: unknown): string {
  if (error instanceof AppError) return error.code;
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === 'object' && response !== null) {
      const label = (response as { error?: unknown }).error;
      if (typeof label === 'string') return label;
    }
    return error.name;
  }
  return statusOf(error) >= 500 ? 'Internal Server Error' : 'Bad Request';
}

function detailsOf(error: unknown): string {
  if (error instanceof AppError) {
    return error.details !== undefined
      ? typeof error.details === 'string'
        ? error.details
        : JSON.stringify(error.details)
      : `${error.name}[${error.code}]`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

/** دالة تعريفية صرفة — قابلة للاختبار دون سياق HTTP/WS. */
export function resolveErrorBody(error: unknown): ErrorBody {
  return {
    success: false,
    statusCode: statusOf(error),
    error: errorLabel(error),
    code: codeOf(error),
    message: messageOf(error),
  };
}

function wsUserIdOf(client: Socket): number | undefined {
  const data = client.data as unknown as { userId?: number } | undefined;
  return data?.userId;
}

/* getRequest() في أنواع NestJS تُرجع any — cast مزدوج يتجاوز no-unnecessary-type-assertion ويبقى ثابتًا تحت --fix. */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
function httpUserIdOf(host: ArgumentsHost): number | undefined {
  const request = host.switchToHttp().getRequest() as unknown as {
    user?: { userId?: number };
  };
  return request?.user?.userId;
}
/* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */

/**
 * فلتر عام يلتقط كل الاستثناءات (HTTP و WebSocket):
 * - AppError → userMessage مباشرة.
 * - HttpException → رسالة عربية حسب الحالة + تمرير code إن وُجد.
 * - أي خطأ آخر → رسالة عامة + تسجيل التفاصيل كاملة.
 * WS: يبث حدث `error` بـ { code, message, statusCode, timestamp }.
 * HTTP: يرجع { success:false, statusCode, error, code, message }.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const body = resolveErrorBody(error);
    const isWs = host.getType() === 'ws';

    const userId = isWs
      ? wsUserIdOf(host.switchToWs().getClient<Socket>())
      : httpUserIdOf(host);

    this.logger.error(
      `[${isWs ? 'ws' : 'http'}] userId=${userId ?? '-'} code=${body.code} status=${body.statusCode} detail=${detailsOf(error)}`,
      error instanceof Error ? error.stack : undefined,
    );

    if (isWs) {
      const client = host.switchToWs().getClient<Socket>();
      client.emit('error', {
        code: body.code,
        message: body.message,
        statusCode: body.statusCode,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const response = host.switchToHttp().getResponse<Response>();
    response.status(body.statusCode).json(body);
  }
}

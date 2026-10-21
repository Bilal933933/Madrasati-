import { ErrorCode } from './error-codes.js';

export interface AppErrorOptions {
  code: ErrorCode;
  status: number;
  userMessage?: string;
  details?: unknown;
}

/**
 * خطأ موحّد يفصل ما يصل للطالب عمّا يُسجَّل داخليًا:
 * - `userMessage`: نص عربي مقصود للعرض فقط.
 * - `details`: تفاصيل فنية (إنجليزية غالبًا) لا تُرسل للعميل أبدًا.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly userMessage: string;
  readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.userMessage ?? 'حدث خطأ غير متوقع. حاول مرة أخرى.');
    this.name = 'AppError';
    this.code = options.code;
    this.status = options.status;
    this.userMessage = options.userMessage ?? this.message;
    this.details = options.details;
  }
}

import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';

/** مدخلات غير صحيحة (400) — رسالتها تُعرض للطالب كما هي. */
export class ValidationError extends AppError {
  constructor(userMessage: string, details?: unknown) {
    super({
      code: ErrorCode.VALIDATION,
      status: 400,
      userMessage,
      details,
    });
  }
}

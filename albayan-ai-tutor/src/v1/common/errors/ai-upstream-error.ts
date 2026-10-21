import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';

/** فشل في خدمة خارجية (Gemini) (503) — يحمل سبب الخطأ الأصلي داخليًا فقط. */
export class AiUpstreamError extends AppError {
  constructor(original: unknown) {
    super({
      code: ErrorCode.AI_UPSTREAM,
      status: 503,
      userMessage: 'حدث خطأ في خدمة الذكاء الاصطناعي. حاول مجددًا بعد قليل.',
      details: original instanceof Error ? original.message : String(original),
    });
  }
}

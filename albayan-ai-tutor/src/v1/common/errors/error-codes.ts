/** رموز الأخطاء الموحّدة — تُرسَل للعميل مع كل استجابة خطأ (HTTP و WebSocket). */
export enum ErrorCode {
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  RATE_LIMIT = 'RATE_LIMIT',
  AI_UPSTREAM = 'AI_UPSTREAM',
  INTERNAL = 'INTERNAL',
}

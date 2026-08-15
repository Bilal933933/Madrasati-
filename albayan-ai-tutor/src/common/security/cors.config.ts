/**
 * إعداد CORS موحّد للخدمة كلها (REST + WebSocket) — مصدر واحد للأوريجنات.
 * يُستهلك من main.ts (enableCors) و chat.gateway.ts (cors) معاً.
 */

/** يقرأ الأوريجنات المسموحة من FRONTEND_URL (مفصولة بفواصل) أو الافتراضي المحلي. */
export const corsOrigins = (): string[] => {
  const raw = process.env.FRONTEND_URL?.trim();
  if (!raw) return ['http://localhost:3000'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

/** خيارات `enableCors` في Nest — تتضمن السماح برأس المصادقة للمعاملات المسبقة (preflight). */
export const corsOptions = (): {
  origin: string[];
  methods: string[];
  allowedHeaders: string[];
} => ({
  origin: corsOrigins(),
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
});

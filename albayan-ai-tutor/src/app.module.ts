import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppLoggerMiddleware } from './v1/common/logger/app-logger.middleware.js';
import { V1Module } from './v1/v1.module.js';
import { V2Module } from './v2/v2.module.js';

/**
 * الملف الرئيسي للمشروع — مفتاح نحيف فقط:
 * يستورد حزمة الإصدار الذي نعمل عليه من ملف المتغيرات الواحد (.env → ACTIVE_ASSISTANT).
 * - 'chat' أو 'v1' → حزمة v1 (المساعد الأول).
 * - غيرها (مثل 'smart-assistant' أو 'v2') → حزمة v2 (المساعد الثاني).
 */
const activeAssistant = (process.env.ACTIVE_ASSISTANT ?? 'smart-assistant')
  .trim()
  .toLowerCase();
const VersionModule =
  activeAssistant === 'chat' || activeAssistant === 'v1' ? V1Module : V2Module;

@Module({
  imports: [VersionModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}

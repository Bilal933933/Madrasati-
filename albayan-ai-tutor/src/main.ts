import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  // TODO(logging backlog): ربط LoggerService كـ NestLogger عبر app.useLogger()
  // لتوحيد سجلات إقلاع Nest الداخلية مع Winston (مؤجل — ليست أولوية حاليًا).

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

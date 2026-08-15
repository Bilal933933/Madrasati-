import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { corsOptions } from './common/security/cors.config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', { limit: '64kb' });
  app.use(helmet());
  app.enableCors(corsOptions());

  // TODO(logging backlog): ربط LoggerService كـ NestLogger عبر app.useLogger()
  // لتوحيد سجلات إقلاع Nest الداخلية مع Winston (مؤجل — ليست أولوية حاليًا).

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

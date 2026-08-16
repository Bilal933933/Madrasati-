import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { IndexerService } from '../knowledge/indexer.service.js';

/**
 * أمر فهرسة قاعدة المتجهات:
 *   npm run index:vector            — الفهرسة الكاملة (مدرسي + مراجع + كتب عامة + دروس)
 *   npm run index:vector -- --prefix textbook/primary/primary_4   — فهرس مسارًا واحدًا (تجريبي)
 *   npm run index:vector -- --no-general  — يتخطى الكتب العامة
 *   npm run index:vector -- --no-lessons  — يتخطى دروس DB
 */
async function main() {
  const args = process.argv.slice(2);
  const prefixFlag = args.indexOf('--prefix');
  const docPathPrefix =
    prefixFlag >= 0 && args[prefixFlag + 1] ? args[prefixFlag + 1] : undefined;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  try {
    const indexer = app.get(IndexerService);
    const result = await indexer.run({
      docPathPrefix,
      includeGeneral: !args.includes('--no-general'),
      includeLessons: !args.includes('--no-lessons'),
    });
    process.stdout.write(
      `done upserted=${result.upserted} skipped=${result.skipped}\n`,
    );
  } finally {
    await app.close();
  }
}

void main().catch((err: unknown) => {
  process.stderr.write(
    `indexer-failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exitCode = 1;
});

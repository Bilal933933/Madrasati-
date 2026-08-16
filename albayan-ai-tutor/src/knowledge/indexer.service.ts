import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { splitMarkdown, countWords } from './chunker.js';
import { DocKeyService } from './doc-key.service.js';
import { EmbeddingService } from './embedding.service.js';
import { MarkdownLoader } from './markdown-loader.js';
import { extractTipTapText } from './tiptap.js';
import { VectorService, type VectorChunkRow } from './vector.service.js';

export interface IndexOptions {
  /** إن مُرّر، يُقيَّد الفهرسة بملفات تبدأ مساراتها بهذه البادئة (لمرحلة تجريبية). */
  docPathPrefix?: string;
  /** يشمل فهرسة الكتب العامة (كسولة — قراءة أقسام من القرص). */
  includeGeneral?: boolean;
  /** يشمل فهرسة فقرات الدروس من DB (الطبقة 1). */
  includeLessons?: boolean;
}

interface PendingChunk {
  row: VectorChunkRow;
}

/**
 * يبني/يحدّث جدول knowledge_chunks في قاعدة المتجهات من مصادر المعرفة:
 * - المدرسي/المراجع: مقاطع 500 كلمة (مفتاح: المسار+الترتيب).
 * - الكتب العامة: أقسام صفحات (مفتاح: الكتاب+العنوان+الصفحة).
 * - دروس DB: فقرات (مفتاح: lesson:id+الترتيب).
 * الفهرسة قابلة للإعادة بلا تكرار بفضل upsert على doc_key.
 */
@Injectable()
export class IndexerService {
  constructor(
    private readonly markdown: MarkdownLoader,
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
    private readonly vector: VectorService,
    private readonly logger: LoggerService,
  ) {}

  async run(opts: IndexOptions = {}): Promise<{
    upserted: number;
    skipped: number;
  }> {
    const pending: PendingChunk[] = [];

    // 1) المدرسي/المراجع (مقاطع 500 كلمة).
    for (const doc of this.markdown.all()) {
      if (opts.docPathPrefix && !doc.path.startsWith(opts.docPathPrefix)) {
        continue;
      }
      const chunks = splitMarkdown(doc.body, {
        targetWords: 500,
        overlapWords: 60,
      });
      chunks.forEach((chunk, index) => {
        pending.push({
          row: {
            docKey: DocKeyService.forMarkdownChunk(doc.path, index),
            docPath: doc.path,
            docType: doc.type,
            subjectId: doc.subjectId,
            gradeId: doc.gradeId,
            lessonId: null,
            heading: chunk.heading,
            ordinal: index,
            text: chunk.text,
            pageStart: chunk.startPage,
            pageEnd: chunk.endPage,
            wordCount: countWords(chunk.text),
          },
        });
      });
    }

    // 2) الكتب العامة (أقسام صفحات).
    if (opts.includeGeneral !== false) {
      for (const book of this.markdown.allGeneralBooks()) {
        for (const part of book.parts) {
          for (const section of part.sections) {
            if (section.kind !== 'content') continue;
            const text = this.markdown.readSection(book, section);
            if (!text) continue;
            // قسم كبير يُقصَّ إلى مقاطع 500 كلمة مع الحفاظ على المفتاح النمطي.
            const chunks = splitMarkdown(text, {
              targetWords: 500,
              overlapWords: 60,
            });
            const body = chunks.length > 0 ? chunks : [{ text }];
            body.forEach((chunk, index) => {
              pending.push({
                row: {
                  docKey:
                    index === 0
                      ? DocKeyService.forGeneralSection(
                          book.id,
                          section.title,
                          section.page,
                        )
                      : DocKeyService.forGeneralSection(
                          `${book.id}:p${section.page}`,
                          `${section.title}#${index + 1}`,
                          section.page,
                        ),
                  docPath: `references/general/${book.id}`,
                  docType: 'general',
                  subjectId: null,
                  gradeId: null,
                  lessonId: null,
                  heading: section.title,
                  ordinal: section.page,
                  text: chunk.text,
                  pageStart: section.page,
                  pageEnd: section.endPage ?? section.page,
                  wordCount: countWords(chunk.text),
                },
              });
            });
          }
        }
      }
    }

    // 3) دروس DB — فقرات (الطبقة 1).
    if (opts.includeLessons !== false) {
      pending.push(...(await this.collectLessonParagraphs()));
    }

    // تحميل متجهات دفعات ثم upsert — بلا نسخ الصف الذي فُهرس مسبقًا بنفس المفتاح.
    let upserted = 0;
    const batchSize = this.embeddingBatchSize;
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize);
      const vectors = await this.embedding.embedBatch(
        batch.map((p) => p.row.text),
      );
      for (let j = 0; j < batch.length; j++) {
        await this.vector.upsert(batch[j].row, vectors[j]);
        upserted += 1;
      }
      if (upserted % (batchSize * 4) === 0 || upserted === pending.length) {
        this.logger.info(
          { event: 'indexer.progress' },
          `الفهرسة: ${upserted}/${pending.length}`,
          { upserted, total: pending.length },
        );
      }
    }

    this.logger.info(
      { event: 'indexer.done' },
      `اكتملت الفهرسة: ${upserted} مقطعًا`,
      { upserted },
    );
    return { upserted, skipped: pending.length - upserted };
  }

  private get embeddingBatchSize(): number {
    const parsed = Number.parseInt(process.env.EMBEDDING_BATCH_SIZE ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
  }

  /** يجمع فقرات كل الدروس المنشورة كنصوص (نفس نافذة الطبقة 1 في RAG). */
  private async collectLessonParagraphs(): Promise<PendingChunk[]> {
    const lessons = await this.prisma.lessons.findMany({
      where: { is_published: true },
      select: { id: true },
      take: 200,
      orderBy: { sort_order: 'asc' },
    });

    const pending: PendingChunk[] = [];
    for (const lesson of lessons) {
      const paragraphs = await this.prisma.paragraphs.findMany({
        where: { lesson_id: lesson.id },
        select: { id: true, lesson_id: true, title: true, content: true },
        orderBy: { sort_order: 'asc' },
      });

      let index = 0;
      for (const p of paragraphs) {
        const extracted = extractTipTapText(p.content);
        if (!extracted.ok) {
          this.logger.warn(
            { event: 'indexer.paragraph_extract_failed' },
            'تخطّي فقرة تعذّر استخراج نصها',
            { lessonId: Number(p.lesson_id), paragraphId: Number(p.id) },
          );
          continue;
        }
        if (extracted.text.length === 0) continue;
        pending.push({
          row: {
            docKey: DocKeyService.forParagraph(Number(lesson.id), index),
            docPath: `lessons/${lesson.id}`,
            docType: 'lesson',
            subjectId: null,
            gradeId: null,
            lessonId: Number(lesson.id),
            heading: p.title ?? null,
            ordinal: index,
            text: extracted.text,
            pageStart: null,
            pageEnd: null,
            wordCount: countWords(extracted.text),
          },
        });
        index += 1;
      }
    }
    return pending;
  }
}

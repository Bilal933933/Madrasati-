import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/vector/client.js';

export interface VectorChunkRow {
  docKey: string;
  docPath: string;
  docType: string;
  subjectId: number | null;
  gradeId: number | null;
  lessonId: number | null;
  heading: string | null;
  ordinal: number | null;
  text: string;
  pageStart: number | null;
  pageEnd: number | null;
  wordCount: number | null;
}

export interface VectorSearchHit {
  docKey: string;
  docPath: string;
  docType: string;
  subjectId: number | null;
  gradeId: number | null;
  lessonId: number | null;
  heading: string | null;
  text: string;
  pageStart: number | null;
  pageEnd: number | null;
  /** تشابه جيب التمام [0,1] */
  similarity: number;
}

/**
 * الوصول إلى قاعدة المتجهات (Neon):
 * - عمود embedding من نوع halfvec لا تدعمه Prisma أصلياً → كل التعامل عبر SQL خام.
 * - الفلترة الوصفية (subject/grade) قبل البحث الدلالي لنفس منطق مطابقة السياق.
 */
@Injectable()
export class VectorService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('VECTOR_DATABASE_URL'),
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /** إدراج/تحديث مقطع مع متجهه — نفس المفتاح يُحدَّث في مكانه بلا تكرار. */
  async upsert(row: VectorChunkRow, embedding: number[]): Promise<void> {
    const text = `[${embedding.join(',')}]`;
    await this.prisma.$executeRaw`
      INSERT INTO knowledge_chunks (
        "docKey", "docPath", "docType", "subjectId", "gradeId", "lessonId",
        "heading", "ordinal", "text", "pageStart", "pageEnd", "wordCount",
        "embedding", "updatedAt"
      ) VALUES (
        ${row.docKey}, ${row.docPath}, ${row.docType}, ${row.subjectId},
        ${row.gradeId}, ${row.lessonId}, ${row.heading}, ${row.ordinal},
        ${row.text}, ${row.pageStart}, ${row.pageEnd}, ${row.wordCount},
        ${text}::halfvec, now()
      )
      ON CONFLICT ("docKey") DO UPDATE SET
        "docPath" = EXCLUDED."docPath",
        "docType" = EXCLUDED."docType",
        "subjectId" = EXCLUDED."subjectId",
        "gradeId" = EXCLUDED."gradeId",
        "lessonId" = EXCLUDED."lessonId",
        "heading" = EXCLUDED."heading",
        "ordinal" = EXCLUDED."ordinal",
        "text" = EXCLUDED."text",
        "pageStart" = EXCLUDED."pageStart",
        "pageEnd" = EXCLUDED."pageEnd",
        "wordCount" = EXCLUDED."wordCount",
        "embedding" = EXCLUDED."embedding",
        "updatedAt" = now()
    `;
  }

  /** بحث دلالي: أقرب K مقطع تشابهاً مع سؤال، مفلترة بالمادة/الصف. */
  async search(
    embedding: number[],
    opts: { subjectId?: number | null; gradeId?: number | null; topK?: number },
  ): Promise<VectorSearchHit[]> {
    const topK = opts.topK ?? 20;
    const vec = `[${embedding.join(',')}]`;

    const subject = opts.subjectId ?? null;
    const grade = opts.gradeId ?? null;

    const rows = await this.prisma.$queryRaw<
      Array<{
        docKey: string;
        docPath: string;
        docType: string;
        subjectId: number | null;
        gradeId: number | null;
        lessonId: number | null;
        heading: string | null;
        text: string;
        pageStart: number | null;
        pageEnd: number | null;
        similarity: number;
      }>
    >`
      SELECT
        "docKey", "docPath", "docType", "subjectId", "gradeId", "lessonId",
        "heading", "text", "pageStart", "pageEnd",
        1 - ("embedding" <=> ${vec}::halfvec) AS similarity
      FROM knowledge_chunks
      WHERE
        (${subject}::bigint IS NULL OR "subjectId" = ${subject} OR "docType" = 'general')
        AND (${grade}::bigint IS NULL OR "gradeId" = ${grade} OR "docType" = 'general')
      ORDER BY "embedding" <=> ${vec}::halfvec
      LIMIT ${topK}
    `;

    return rows.map((r) => ({
      docKey: r.docKey,
      docPath: r.docPath,
      docType: r.docType,
      subjectId: r.subjectId,
      gradeId: r.gradeId,
      lessonId: r.lessonId,
      heading: r.heading,
      text: r.text,
      pageStart: r.pageStart,
      pageEnd: r.pageEnd,
      similarity: r.similarity,
    }));
  }

  /** إجمالي المقاطع المفهرسة (لمتابعة تقدم الفهرسة). */
  async count(): Promise<number> {
    const row = await this.prisma.$queryRaw<Array<{ n: bigint }>>`
      SELECT count(*)::bigint AS n FROM knowledge_chunks
    `;
    return Number(row[0]?.n ?? 0);
  }
}

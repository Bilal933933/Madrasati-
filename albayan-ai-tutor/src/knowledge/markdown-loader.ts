import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * خريطة مفاتيح الصفوف الرائدة — مفتاح الفولدر => اسم الصف في قاعدة البيانات.
 * تطابق CurriculumData::flagshipGrades في الباك لتحويل المسار إلى معرف DB.
 */
const FLAGSHIP_GRADES: Record<string, string> = {
  primary_4: 'الصف الرابع الابتدائي',
  prep_1: 'الصف الأول الإعدادي',
  secondary_1: 'الصف الأول الثانوي',
};

export type MarkdownDocType = 'textbook' | 'reference';

export interface MarkdownDoc {
  /** المسار النسبي للملف من مجلد content (مثل textbook/primary/primary_4/...). */
  path: string;
  /** نوع المصدر: الكتاب المدرسي أو مرجع عام. */
  type: MarkdownDocType;
  stageKey: string;
  gradeKey: string;
  subjectName: string;
  courseName: string | null;
  title: string;
  body: string;
  /** معرفات قاعدة البيانات بعد الحل (nullable إن لم تُستوفَ في الاستعلام). */
  subjectId: number | null;
  gradeId: number | null;
}

interface RawDoc {
  path: string;
  type: MarkdownDocType;
  stageKey: string;
  gradeKey: string;
  subjectName: string;
  courseName: string | null;
  title: string;
  body: string;
}

/**
 * يقرأ ملفات المعرفة من مجلد `content/{textbook,references}` عند إقلاع الخدمة:
 * - يقرأ الملفات تكراريًا ويحلّل front-matter (عنوان/مفتاح الصف/المادة/الوحدة).
 * - يستنتج المرحلة والصف والمادة والوحدة والنوع من بنية المسار نفسه.
 * - يحوّل مفتاحي الصف/المرحلة واسم المادة إلى معرفات قاعدة البيانات عبر Prisma.
 * - يوفر `matching()` لنافذة الـ RAG مع سياق الطالب.
 */
@Injectable()
export class MarkdownLoader implements OnModuleInit {
  private readonly logger = new Logger(MarkdownLoader.name);
  private readonly docs: MarkdownDoc[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const raw = this.readAll();
    if (raw.length > 0) {
      this.docs.push(...(await this.resolve(raw)));
    }
    this.logger.log(`تم تحميل ${this.docs.length} ملف معرفة Markdown`);
  }

  /** يقرأ كل ملفات .md داخل مجلد content (مجلدا textbook و references). */
  private readAll(): RawDoc[] {
    const files: string[] = [];
    for (const type of ['textbook', 'references'] as const) {
      const root = path.join(CONTENT_DIR, type);
      if (!fs.existsSync(root)) continue;
      files.push(
        ...fs
          .readdirSync(root, { recursive: true, encoding: 'utf8' })
          .filter((f) => typeof f === 'string' && f.endsWith('.md'))
          .map((f) => path.join(type, f)),
      );
    }

    const mapped: (RawDoc | null)[] = files.map((relative): RawDoc | null => {
      const absolute = path.join(CONTENT_DIR, relative);
      const raw = fs.readFileSync(absolute, 'utf8');
      const { meta, body } = parseFrontMatter(raw);
      const segments = relative.split(path.sep);

      const [type, stageKey, gradeKey, subjectName, courseName] = segments;
      if (!type || !stageKey || !gradeKey || !subjectName) return null;

      return {
        path: relative,
        type: type === 'reference' ? 'reference' : 'textbook',
        stageKey,
        gradeKey,
        subjectName,
        courseName: courseName ?? null,
        title: meta.title || path.basename(relative, '.md'),
        body,
      };
    });

    return mapped.filter((doc): doc is RawDoc => doc !== null);
  }

  /** يحل مفتاحي المرحلة/الصف واسم المادة إلى معرفات DB لكل ملف. */
  private async resolve(rawDocs: RawDoc[]): Promise<MarkdownDoc[]> {
    const cache = new Map<
      string,
      { subjectId: number; gradeId: number } | null
    >();
    const resolved: MarkdownDoc[] = [];

    for (const doc of rawDocs) {
      const key = `${doc.stageKey}|${doc.gradeKey}|${doc.subjectName}`;
      if (!cache.has(key)) {
        cache.set(key, await this.lookupIds(doc));
      }
      const ids = cache.get(key) ?? null;

      resolved.push({
        ...doc,
        subjectId: ids?.subjectId ?? null,
        gradeId: ids?.gradeId ?? null,
      });
    }

    return resolved;
  }

  /** يستعلم Prisma: المرحلة بالمفتاح ← الصف بالاسم ← المادة بالاسم ضمن الصف. */
  private async lookupIds(
    doc: RawDoc,
  ): Promise<{ subjectId: number; gradeId: number } | null> {
    const stage = await this.prisma.stages.findUnique({
      where: { key: doc.stageKey },
      select: { id: true },
    });
    if (!stage) return null;

    const gradeName = FLAGSHIP_GRADES[doc.gradeKey] ?? null;
    const grade = gradeName
      ? await this.prisma.grades.findFirst({
          where: { stage_id: stage.id, name: gradeName },
          select: { id: true },
        })
      : null;
    if (!grade) return null;

    const subject = await this.prisma.subjects.findFirst({
      where: { grade_id: grade.id, name: doc.subjectName },
      select: { id: true },
    });
    if (!subject) return null;

    return { subjectId: Number(subject.id), gradeId: Number(grade.id) };
  }

  /**
   * يرجّع الملفات المطابقة لسياق الطالب — نفس منطق RagService:
   * المطابقة بالمادة إن وُجدت، وإلا بالصف.
   */
  matching(opts: {
    subjectId?: number | null;
    gradeId?: number | null;
  }): MarkdownDoc[] {
    return this.docs.filter((doc) => {
      if (opts.subjectId != null && doc.subjectId === opts.subjectId)
        return true;
      if (
        opts.subjectId == null &&
        opts.gradeId != null &&
        doc.gradeId === opts.gradeId
      ) {
        return true;
      }
      return false;
    });
  }

  /** كل الملفات المحمّلة (للاختبارات والتصحيح). */
  all(): MarkdownDoc[] {
    return this.docs;
  }
}

const CONTENT_DIR = path.resolve(process.cwd(), 'content');

interface FrontMatter {
  [key: string]: string;
}

/** يفصل front-matter (بين ---) عن النص — بدون تبعيات YAML. */
export function parseFrontMatter(raw: string): {
  meta: FrontMatter;
  body: string;
} {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    return { meta: {}, body: raw };
  }

  const meta: FrontMatter = {};
  let end = 1;
  for (; end < lines.length; end++) {
    const line = lines[end];
    if (line.trim() === '---') break;
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      meta[key] = value;
    }
  }

  return {
    meta,
    body: lines
      .slice(end + 1)
      .join('\n')
      .trim(),
  };
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LoggerService } from '../common/logger/logger.service.js';
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

/** قسم من فهرس كتاب عام — موضوع على مرساة صفحة. */
export interface BookSection {
  id: string;
  title: string;
  kind: 'content' | 'noise';
  page: number;
  endPage?: number;
  concepts: string[];
}

/** جزء من كتاب عام — ملف markdown يحوي مراسي ## صفحة. */
export interface BookPart {
  file: string;
  pages: [number, number];
  chapter: string | null;
  sections: BookSection[];
}

/** فهرس كتاب عام (references/general/{book}/metadata.json). */
export interface GeneralBookDoc {
  id: string;
  title: string;
  author: string | null;
  subjectName: string;
  totalPages: number;
  /** المسار المطلق لمجلد الكتاب. */
  rootPath: string;
  parts: BookPart[];
  /** معرفات مواد اللغة العربية بعد الحل — يطابق أي صف. */
  subjectIds: number[];
  /** معرفات الصفوف التي تدرس مادة الكتاب — للمطابقة حين لا يحدد الطالب مادة. */
  gradeIds: number[];
}

interface BookMetadata {
  id: string;
  title: string;
  author?: string | null;
  subject?: string;
  total_pages?: number;
  parts?: BookPart[];
}

/**
 * يقرأ ملفات المعرفة من مجلد `content/{textbook,references}` عند إقلاع الخدمة:
 * - يقرأ الملفات تكراريًا ويحلّل front-matter (عنوان/مفتاح الصف/المادة/الوحدة).
 * - يستنتج المرحلة والصف والمادة والوحدة والنوع من بنية المسار نفسه.
 * - يحوّل مفتاحي الصف/المرحلة واسم المادة إلى معرفات قاعدة البيانات عبر Prisma.
 * - الكتب العامة (references/general/*) تُفهرس من metadata.json ولا تُحمَّل
 *   أجسامها كاملة؛ تُقرأ أقسامها كسولة عبر readSection() عند الحاجة.
 * - يوفر `matching()` لنافذة الـ RAG مع سياق الطالب.
 */
@Injectable()
export class MarkdownLoader implements OnModuleInit {
  private readonly docs: MarkdownDoc[] = [];
  private generalBooks: GeneralBookDoc[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    const raw = this.readAll();
    if (raw.length > 0) {
      this.docs.push(...(await this.resolve(raw)));
    }
    const books = this.loadGeneralBooks();
    if (books.length > 0) {
      this.generalBooks = await this.resolveGeneralBooks(books);
    }
    this.logger.info(
      { event: 'knowledge_loaded' },
      `تم تحميل ${this.docs.length} ملف معرفة Markdown و${this.generalBooks.length} كتابًا عامًا مفهرسًا`,
    );
  }

  /** يقرأ كل ملفات .md داخل مجلد content (مجلدا textbook و references دون general). */
  private readAll(): RawDoc[] {
    const files: string[] = [];
    for (const type of ['textbook', 'references'] as const) {
      const root = path.join(CONTENT_DIR, type);
      if (!fs.existsSync(root)) continue;
      const rels = fs
        .readdirSync(root, { recursive: true, encoding: 'utf8' })
        .filter((f): f is string => typeof f === 'string' && f.endsWith('.md'));
      for (const rel of rels) {
        if (type === 'references' && rel.split(/[\\/]/).includes('general')) {
          continue;
        }
        files.push(path.join(type, rel));
      }
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

  /** يقرأ فهارس الكتب العامة من مجلد references/general. */
  private loadGeneralBooks(): GeneralBookDoc[] {
    const root = path.join(CONTENT_DIR, 'references', 'general');
    if (!fs.existsSync(root)) return [];

    const books: GeneralBookDoc[] = [];
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const metaPath = path.join(root, entry.name, 'metadata.json');
      if (!fs.existsSync(metaPath)) continue;
      try {
        const meta = JSON.parse(
          fs.readFileSync(metaPath, 'utf8'),
        ) as BookMetadata;
        if (!meta.title || !Array.isArray(meta.parts)) continue;
        books.push({
          id: meta.id || entry.name,
          title: meta.title,
          author: meta.author ?? null,
          subjectName: meta.subject ?? 'اللغة العربية',
          totalPages: meta.total_pages ?? 0,
          rootPath: path.join(root, entry.name),
          parts: meta.parts,
          subjectIds: [],
          gradeIds: [],
        });
      } catch {
        this.logger.warn(
          { event: 'metadata_invalid' },
          `metadata.json غير صالح في ${metaPath}`,
          { book: entry.name },
        );
      }
    }
    return books;
  }

  /** يحل أسماء مواد الكتب العامة إلى معرفات — مادة واحدة قد تتكرر عبر صفوف. */
  private async resolveGeneralBooks(
    books: GeneralBookDoc[],
  ): Promise<GeneralBookDoc[]> {
    const names = [...new Set(books.map((b) => b.subjectName))];
    const subjects = await this.prisma.subjects.findMany({
      where: { name: { in: names } },
      select: { id: true, grade_id: true },
    });
    const ids = subjects.map((s) => Number(s.id));
    const gradeIds = [...new Set(subjects.map((s) => Number(s.grade_id)))];
    return books.map((b) => ({
      ...b,
      subjectIds: ids,
      gradeIds,
    }));
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

  /**
   * يرجّع الكتب العامة المطابقة للمادة أو للصف:
   * - بالمادة الحالية للطالب (مثلًا مادة لغة عربية في الصف 4).
   * - أو بالصف نفسه حين لا يحدد الطالب مادة حاليًا.
   * (مثل كيف تتقن النحو تخدم كل صفوف اللغة العربية).
   */
  matchingGeneral(opts: {
    subjectId?: number | null;
    gradeId?: number | null;
  }): GeneralBookDoc[] {
    const subjectId = opts.subjectId;
    if (subjectId != null) {
      return this.generalBooks.filter((book) =>
        book.subjectIds.includes(subjectId),
      );
    }
    const gradeId = opts.gradeId;
    if (gradeId != null) {
      return this.generalBooks.filter((book) =>
        book.gradeIds.includes(gradeId),
      );
    }
    return [];
  }

  /**
   * يقرأ نصّ قسم واحد من ملف الجزء المعني كسولة:
   * يجد مرساة `## صفحة N` المطابقة لصفحة القسم ويأخذ حتى المرساة التالية.
   */
  readSection(book: GeneralBookDoc, section: BookSection): string | null {
    const part = book.parts.find(
      (p) => section.page >= p.pages[0] && section.page <= p.pages[1],
    );
    if (!part) return null;

    const text = fs.readFileSync(path.join(book.rootPath, part.file), 'utf8');
    const lines = text.split(/\r?\n/);

    let start = -1;
    for (let i = 0; i < lines.length; i++) {
      const m = /^##\s*صفحة\s+(\d+)/.exec(lines[i].trim());
      if (m && Number(m[1]) === section.page) {
        start = i + 1;
        break;
      }
    }
    if (start === -1) return null;

    const body: string[] = [];
    for (let i = start; i < lines.length; i++) {
      if (/^##\s*صفحة\s+\d+/.test(lines[i].trim())) break;
      body.push(lines[i]);
    }

    const content = body.join('\n').trim();
    return content.length > 0 ? content : null;
  }

  /** كل الملفات المحمّلة (للاختبارات والتصحيح). */
  all(): MarkdownDoc[] {
    return this.docs;
  }

  /** كل الكتب العامة المفهرسة (للاختبارات والتصحيح). */
  allGeneralBooks(): GeneralBookDoc[] {
    return this.generalBooks;
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

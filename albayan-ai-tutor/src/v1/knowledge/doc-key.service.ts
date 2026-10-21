import { createHash } from 'node:crypto';

/**
 * يولّد مفاتيح مستقرة (docKey) لقطع المعرفة بحيث تظل معرّفة منطقياً
 * عند إعادة الفهرسة: تغيير النص لا يولّد مفتاحاً جديداً (يُحدَّث في مكانه)،
 * والمفتاح يعتمد على موقع المقطع لا محتواه.
 */
export class DocKeyService {
  /** مقطع markdown (textbook/references) — موقع: المسار + ترتيب المقطع داخل الملف. */
  static forMarkdownChunk(docPath: string, ordinal: number): string {
    return hash(`${docPath}#${ordinal}`);
  }

  /** قسم كتاب عام — موقع: معرّف الكتاب + عنوان القسم + صفحة البداية. */
  static forGeneralSection(
    bookId: string,
    sectionTitle: string,
    pageStart: number,
  ): string {
    return hash(`${bookId}#${sectionTitle}#${pageStart}`);
  }

  /** فقرة درس من DB — موقع: معرّف الدرس + ترتيب الفقرة ضمن الدرس. */
  static forParagraph(lessonId: number, paragraphIndex: number): string {
    return hash(`lesson:${lessonId}#${paragraphIndex}`);
  }

  /** درس كامل من DB — موقع: معرّف الدرس. */
  static forLesson(lessonId: number): string {
    return hash(`lesson:${lessonId}`);
  }
}

function hash(seed: string): string {
  return createHash('sha256').update(seed, 'utf8').digest('hex');
}

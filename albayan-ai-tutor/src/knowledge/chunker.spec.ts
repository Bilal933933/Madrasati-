import { countWords, splitMarkdown } from './chunker.js';

function words(n: number, seed: number = 0): string {
  return Array.from({ length: n }, (_, i) => `كلمة${seed + i}`).join(' ');
}

describe('chunker', () => {
  describe('countWords', () => {
    it('يعد الكلمات المفصولة بمسافات', () => {
      expect(countWords('أ ب ج')).toBe(3);
      expect(countWords('   ')).toBe(0);
    });
  });

  describe('splitMarkdown', () => {
    it('يعيد صفيفًا فارغًا لنص فارغ', () => {
      expect(splitMarkdown('')).toEqual([]);
      expect(splitMarkdown('   \n\n  ')).toEqual([]);
    });

    it('يكوّن قطعة واحدة لمستند قصير أسفل الهدف', () => {
      const body = '## صفحة 1\n\n' + words(20);
      const chunks = splitMarkdown(body, { targetWords: 200, overlapWords: 0 });

      expect(chunks).toHaveLength(1);
      expect(chunks[0].id).toBe('c-001');
      expect(chunks[0].heading).toContain('صفحة 1');
      expect(chunks[0].wordCount).toBe(20);
      expect(chunks[0].startPage).toBe(1);
      expect(chunks[0].endPage).toBe(1);
    });

    it('يجمّع الصفحات المتتالية حتى بلوغ الهدف محافظًا على نطاق الصفحات', () => {
      const pages = [1, 2, 3, 4]
        .map((p) => `## صفحة ${p}\n\n${words(60, p)}`)
        .join('\n\n');
      const chunks = splitMarkdown(pages, {
        targetWords: 100,
        overlapWords: 0,
      });

      expect(chunks.length).toBe(4);
      expect(chunks[0].heading).toContain('صفحة 1');
      expect(chunks[0].startPage).toBe(1);
      expect(chunks[0].wordCount).toBe(60);
      expect(chunks[3].heading).toContain('صفحة 4');
      expect(chunks[3].startPage).toBe(4);
    });

    it('يُورّث رقم الصفحة إلى العناوين الفرعية التي لا تحمله', () => {
      const body = [
        '## صفحة 21',
        words(5),
        '### باب تابع',
        words(50),
        '## صفحة 22',
        words(40),
      ].join('\n\n');
      const chunks = splitMarkdown(body, { targetWords: 200, overlapWords: 0 });

      expect(chunks[0].startPage).toBe(21);
      expect(chunks[0].heading).toContain('صفحة 21');
      expect(chunks[0].wordCount).toBe(95);
      expect(chunks[0].endPage).toBe(22);
    });

    it('يدمج عناوين الأقسام الصامتة (بدون نص) كمقدمة في العنوان التالي', () => {
      const body = `# الفصل الأول\n\n## صفحة 1\n\n${words(30)}\n\n## صفحة 2\n\n${words(30)}`;
      const chunks = splitMarkdown(body, { targetWords: 300, overlapWords: 0 });

      expect(chunks[0].heading).toContain('الفصل الأول');
      expect(chunks[0].heading).toContain('صفحة 1');
    });

    it('يقسّم المقطع المتجاوز للهدف مع تداخل في البداية', () => {
      const paragraphs = Array.from({ length: 5 }, (_, i) => words(100, i * 7));
      const body = `## صفحة 10\n\n${paragraphs.join('\n\n')}`;
      const overlap = 8;
      const chunks = splitMarkdown(body, {
        targetWords: 120,
        overlapWords: overlap,
      });

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) =>
        expect(chunk.wordCount).toBeLessThanOrEqual(120),
      );

      const tail = chunks[0].text.split(/\s+/).slice(-overlap).join(' ');
      expect(chunks[1].text.startsWith(tail)).toBe(true);
    });

    it('يحافظ على كامل الكلمات عند تجاوز النص للهدف لاحقًا (بلوغ نهاية المقطع الصامت)', () => {
      const body = `## صفحة 1\n\n${words(500)}`;
      const chunks = splitMarkdown(body, { targetWords: 100, overlapWords: 0 });

      expect(chunks.length).toBeGreaterThan(1);
      const totalWords = chunks.reduce(
        (sum, chunk) => sum + chunk.wordCount,
        0,
      );
      expect(totalWords).toBe(500);
    });

    it('يعالج الأسطر الافتتاحية بلا عنوان بأولوية صحيحة', () => {
      const body = `نص افتتاحي قصير.\n\n## صفحة 3\n\n${words(40)}`;
      const chunks = splitMarkdown(body, { targetWords: 400, overlapWords: 0 });

      expect(chunks).toHaveLength(1);
      expect(chunks[0].heading).toBe('(بدون عنوان)');
      expect(chunks[0].startPage).toBeNull();
      expect(chunks[0].endPage).toBe(3);
    });

    it('ينهي فقرة مفردة متجاوزة الهدف بالتداخل الافتراضي دون حلقة لا نهائية (900 كلمة)', () => {
      const body = `## صفحة 1\n\n${words(900)}`;
      const chunks = splitMarkdown(body);

      expect(chunks.length).toBeGreaterThan(1);

      const lastChunkWords = chunks[chunks.length - 1].text
        .split(/\s+/)
        .filter((w) => w.length > 0);
      expect(lastChunkWords[lastChunkWords.length - 1]).toBe('كلمة899');

      const merged = chunks.map((c) => c.text).join(' ');
      for (let i = 0; i < 900; i++) {
        expect(merged).toContain(`كلمة${i}`);
      }
    }, 1000);

    it('يتوسع إلى فقرة مفردة ضخمة دون فقدان كلمات (5000 كلمة)', () => {
      const body = `## صفحة 1\n\n${words(5000)}`;
      const chunks = splitMarkdown(body);

      expect(chunks.length).toBeGreaterThan(6);

      const lastChunkWords = chunks[chunks.length - 1].text
        .split(/\s+/)
        .filter((w) => w.length > 0);
      expect(lastChunkWords[lastChunkWords.length - 1]).toBe('كلمة4999');

      const merged = chunks.map((c) => c.text).join(' ');
      for (let i = 0; i < 5000; i++) {
        expect(merged).toContain(`كلمة${i}`);
      }
    }, 1000);
  });
});

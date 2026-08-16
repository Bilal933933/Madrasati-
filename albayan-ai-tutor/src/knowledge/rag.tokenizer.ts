/**
 * دوال صرفية صرفة لمعالجة النص العربي في RAG — بلا حالة ولا اعتماديات داخلية.
 * منقولة من rag.service.ts لإبقاء المنسق هيكلاً فقط.
 */

/** كلمات استفهام/ربط عامة تُستبعد من التوكنز حتى لا تلوّث المطابقة. */
export const STOPWORDS = new Set([
  'ما',
  'ماذا',
  'ماهو',
  'ماهي',
  'لماذا',
  'كيف',
  'هل',
  'متي',
  'اين',
  'هو',
  'هي',
  'هذا',
  'هذه',
  'ذلك',
  'تلك',
  'ان',
  'ثم',
  'قد',
  'انت',
  'نحن',
]);

/**
 * توكنز مقارنة عامة شائعة في العناوين (الفرق بين...) — تُمنح وزنًا منخفضًا
 * ولا ينهض قسمٌ بها وحدها ليُقرأ.
 */
export const MINOR_TOKENS = new Set(['الفرق', 'بين']);

/**
 * يطبّع النص العربي للمطابقة: يجرّد التشكيل وعلامات الإعراب والتطويل
 * ويوحّد الألف المقصورة والتاء المربوطة والهمزات. ضروري لأن عناوين
 * الفهارس مشكولة بينما أسئلة الطالب غير مشكولة عادة.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0623\u0622\u0625]/g, '\u0627');
}

/**
 * يوسّع الكلمة إلى أشكالها الاحتمالية بعد تطبيعها: يجرّد حروف الجر/العطف
 * المفردة (و ف ب ك ل) وأداة التعريف (ال) المتكررة على شكل و/ف/ب/ك/ل + ال.
 * مثال: «والخبر» ← { والخبر, الخبر, خبر }.
 */
export function expandWord(word: string): Set<string> {
  const out = new Set<string>();
  if (!word) return out;
  out.add(word);
  let w = word;
  while (w.length > 2 && 'وفبكل'.includes(w[0])) {
    w = w.slice(1);
    out.add(w);
  }
  if (w.startsWith('ال') && w.length - 2 >= 3) {
    out.add(w.slice(2));
  }
  return out;
}

/**
 * يتحقق من أن التوكن يطابق كلمة كاملة في النص مع مراعاة البادئات —
 * لا مطابقة جزئية: «بين» لا تطابق «بينما»، و«والخبر» تطابق «الخبر».
 */
export function textMatchesToken(text: string, token: string): boolean {
  const tokenCands = expandWord(normalizeArabic(token).toLowerCase());
  const words = normalizeArabic(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  for (const w of words) {
    for (const c of expandWord(w)) {
      if (tokenCands.has(c)) return true;
    }
  }
  return false;
}

/** يقطّع السؤال إلى توكنز جوهرية بعد التطبيع، مستبعدًا كلمات الاستفهام. */
export function tokenize(text: string): string[] {
  return normalizeArabic(text)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

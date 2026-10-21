import { extractTipTapText } from './tiptap.js';

describe('extractTipTapText', () => {
  const JESMALIA = `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"الجملة التي تبدأ باسم تُسمّى الجملة الاسمية، وتتكوّن من ركنين أساسيين: المبتدأ والخبر. المبتدأ اسم نبدأ به الجملة، والخبر يتمّم معناه."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"السماءُ صافيةٌ."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"الحديقةُ جميلةٌ."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"الكتابُ مفيدٌ."}]}]}]},{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"أي جملة نبدأها باسم وتتمّ معناها بخبر فهي جملة اسمية."}]}]}]}`;

  const ETHRAEYA = `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"لنقرأ هذه الجمل الاسمية ونحدّد فيها المبتدأ والخبر بدقة، فهي نماذج متنوعة يظهر فيها الركنان بوضوح تام."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"السماءُ صافيةٌ."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"الحديقةُ جميلةٌ."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"الكتابُ مفيدٌ."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"المعلمُ عادلٌ."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"الطالبُ مجتهدٌ."}]}]}]},{"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"أرصد أولًا الاسم الذي تفتتح به الجملة."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"أبحث عن الاسم الذي يتمّم معناه."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"أكتب الجملة في دفتر الإعراب مع تحديد الركنين."}]}]}]},{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"تدرب يوميًا على استخراج المبتدأ (الاسم الأول) والخبر (الاسم المتمّم) من الجمل."}]}]}]}`;

  const ADWATI = `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"نتعلّم صيغة الجمع البسيطة بإضافة s: books (كتب)، pens (أقلام)، pencils (أقلام رصاص)، bags (حقائب)."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Books on the desk."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Pens in the bag."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Pencils on the table."}]}]}]}]}`;

  it('يستخرج نصًا مسطحًا من JSON حقيقي (doc→paragraph→bulletList→blockquote)', () => {
    const result = extractTipTapText(JESMALIA);

    expect(result.ok).toBe(true);
    expect(result.text).toContain(
      'الجملة التي تبدأ باسم تُسمّى الجملة الاسمية',
    );
    expect(result.text).toContain('• السماءُ صافيةٌ.');
    expect(result.text).toContain('• الكتابُ مفيدٌ.');
    expect(result.text).toContain(
      'أي جملة نبدأها باسم وتتمّ معناها بخبر فهي جملة اسمية.',
    );
    expect(result.text).not.toContain('"type"');
    expect(result.text).not.toContain('{');
    expect(result.text).not.toContain('}');
  });

  it('يستخرج order/test-Testment قائمة مرقمة (orderedList) من JSON حقيقي (id=5)', () => {
    const result = extractTipTapText(ETHRAEYA);

    expect(result.ok).toBe(true);
    expect(result.text).toContain('1. أرصد أولًا الاسم الذي تفتتح به الجملة.');
    expect(result.text).toContain(
      '3. أكتب الجملة في دفتر الإعراب مع تحديد الركنين.',
    );
    expect(result.text).toContain('تدرب يوميًا على استخراج المبتدأ');
  });

  it('يحافظ على نصوص لاتينية/إنجليزية كما هي (id=160)', () => {
    const result = extractTipTapText(ADWATI);

    expect(result.ok).toBe(true);
    expect(result.text).toContain('Books on the desk.');
    expect(result.text).toContain('Pencils on the table.');
    expect(result.text).toContain('صيغة الجمع البسيطة');
  });

  it('يرجع ok=false للنص غير JSON', () => {
    const result = extractTipTapText('مبتدأ مرفوع');

    expect(result.ok).toBe(false);
    expect(result.text).toBe('');
  });

  it('يرجع ok=false لنص JSON تالف (مبتور)', () => {
    const result = extractTipTapText('{"type":"doc","content":[{"type":"para');

    expect(result.ok).toBe(false);
    expect(result.text).toBe('');
  });

  it('يرجع ok=true ونص فارغ لمستند doc بلا محتوى', () => {
    const result = extractTipTapText('{"type":"doc","content":[]}');

    expect(result.ok).toBe(true);
    expect(result.text).toBe('');
  });

  it('يتجاوز العقد الوسائطية (image) دون كسر ويُكمل الباقي', () => {
    const doc = `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"قبل الصورة"}]},{"type":"image","attrs":{"src":"x.png"}},{"type":"paragraph","content":[{"type":"text","text":"بعد الصورة"}]}]}`;

    const result = extractTipTapText(doc);

    expect(result.ok).toBe(true);
    expect(result.text).toContain('قبل الصورة');
    expect(result.text).toContain('بعد الصورة');
  });

  it('يدمج أجزاء النص المفصولة بعلامات (marks) داخل نفس الفقرة', () => {
    const doc = `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"المبتدأ "},{"type":"text","marks":[{"type":"bold"}],"text":"اسم مرفوع"}]}]}`;

    const result = extractTipTapText(doc);

    expect(result.ok).toBe(true);
    expect(result.text).toContain('المبتدأ اسم مرفوع');
  });
});

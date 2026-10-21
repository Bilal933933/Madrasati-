import { MINOR_TOKENS, textMatchesToken } from './rag.tokenizer.js';

/**
 * بوابة الكفاية: هل توفر النافذة الحالية مواد كافية للإجابة؟
 * 1) شرط صلة صريح: مفردة جوهرية واحدة على الأقل داخل النافذة.
 * 2) نسبة التغطية (المغطاة من التوكنز الجوهرية للسؤال) ≥ العتبة.
 * 3) سور طول ثانوي حتى لا تقدّ نافذة قصيرة تكرارية بأنها "كافية".
 * يحصر النسبةَ على التوكنز الجوهرية فقط (يستبعد MINOR_TOKENS مثل الفرق/بين)
 * حتى لا يبدو سؤال "الفرق بين..." كافيًا بتغطية لا جوهر تجاهها.
 */
export function isLayerSufficient(
  contentWindow: string,
  tokens: string[],
  thresholds: { minContentChars: number; coverageThreshold: number },
): boolean {
  const substantive = tokens.filter((t) => !MINOR_TOKENS.has(t));
  if (substantive.length === 0) return false;
  if (contentWindow.length < thresholds.minContentChars) return false;

  let covered = 0;
  for (const token of substantive) {
    if (textMatchesToken(contentWindow, token)) covered += 1;
  }
  if (covered === 0) return false;
  return covered / substantive.length >= thresholds.coverageThreshold;
}

/** التوكنز الجوهرية للسؤال الممثلة فعلًا في نص معيّن. */
export function coveredSubstantiveTokens(
  tokens: string[],
  text: string,
): Set<string> {
  const covered = new Set<string>();
  for (const token of tokens) {
    if (MINOR_TOKENS.has(token)) continue;
    if (text.length > 0 && textMatchesToken(text, token)) covered.add(token);
  }
  return covered;
}

/** التوكنز الجوهرية الإضافية التي يحققها نص مرشّح ولا تتوفر بعد في النافذة. */
export function addedSubstantiveTokens(
  tokens: string[],
  text: string,
  represented: Set<string>,
): string[] {
  const added: string[] = [];
  for (const token of tokens) {
    if (MINOR_TOKENS.has(token)) continue;
    if (represented.has(token)) continue;
    if (text.length > 0 && textMatchesToken(text, token)) added.push(token);
  }
  return added;
}

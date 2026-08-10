import { isApiError } from "@/lib/apiErrors";
import type { ExamAnswerValue } from "../types/progress.types";
import type {
  ExamAttemptDetail,
  SaveAnswerPayload,
} from "../types/attempt.types";

/** هل السؤال مجاب؟ (exists أو اختيار صريح). */
export function isAnswered(value: ExamAnswerValue | undefined): boolean {
  return value != null && (value.optionId != null || value.booleanValue != null);
}

/** هل القيمة فارغة (لا خيار ولا صحيح/خطأ)؟ */
export function isEmptyValue(v?: ExamAnswerValue): boolean {
  return v == null || (v.optionId == null && v.booleanValue == null);
}

/** تساوي قيمتين مع اعتبار الفارغ مساويًا للفارغ. */
export function sameValue(a: ExamAnswerValue, b?: ExamAnswerValue): boolean {
  if (isEmptyValue(a) && isEmptyValue(b)) return true;
  return a.optionId === b?.optionId && a.booleanValue === b?.booleanValue;
}

/** تشكيل حمولة إجابة الخادم من القيمة المحلية. */
export function toPayload(value: ExamAnswerValue): SaveAnswerPayload {
  return {
    selected_option_id: value.optionId,
    selected_boolean: value.booleanValue,
  };
}

/** تحويل سجل العلامات إلى قائمة معرّفات الأسئلة المعلّمة. */
export function flaggedRecordsToIds(flagged: Record<number, boolean>): number[] {
  return Object.entries(flagged)
    .filter(([, value]) => value === true)
    .map(([key]) => Number(key));
}

/** قيم إجابة الخادم (المحفوظة في المحاولة) بصيغة منضبطة. */
export function seedWebServerAnswers(
  attempt: ExamAttemptDetail
): Record<number, ExamAnswerValue> {
  const map: Record<number, ExamAnswerValue> = {};

  for (const q of attempt.questions) {
    if (q.selected_option_id != null || q.selected_boolean != null) {
      map[q.id] = {
        optionId: q.selected_option_id,
        booleanValue: q.selected_boolean,
      };
    }
  }

  return map;
}

/**
 * دمج إجابات الباك (رسمية) مع النسخة المحلية (أحدث نية للطالب).
 * كل إجابة محلية مختلفة عن الخادم تُضاف إلى قائمة بانتظار الإرسال.
 */
export function computeMerge(
  server: Record<number, ExamAnswerValue>,
  local: Record<number, ExamAnswerValue>
): { answers: Record<number, ExamAnswerValue>; pending: number[] } {
  const answers: Record<number, ExamAnswerValue> = { ...server };
  const pending: number[] = [];

  for (const [key, localValue] of Object.entries(local)) {
    const qid = Number(key);
    answers[qid] = localValue;
    if (!sameValue(localValue, server[qid])) {
      pending.push(qid);
    }
  }

  return { answers, pending };
}

/** الوقت المتبقي بالثواني حتى deadline_at (صفر إن انتهى أو غائب). */
export function calcRemaining(attempt: ExamAttemptDetail): number {
  if (!attempt.deadline_at) return 0;
  return Math.max(
    0,
    Math.floor((new Date(attempt.deadline_at).getTime() - Date.now()) / 1000)
  );
}

/**
 * هل خطأ الباك يحمل إشارة توجيه للنتيجة؟ (انتهى وقت الامتحان وصُححت الإجابات تلقائيًا)
 * الباك يبثّ `redirect_to` في errors عند إنهاء محاولة منتهية.
 */
export function expiryRedirectId(error: unknown): number | null {
  if (!isApiError(error)) return null;
  const raw = error.errors?.redirect_to?.[0];
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}
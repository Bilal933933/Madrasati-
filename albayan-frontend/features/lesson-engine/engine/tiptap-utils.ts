import type { TiptapDoc } from "./tiptap-types";

/**
 * يحوّل محتوى الفقرة (سلسلة JSON من الباك) إلى كائن TiptapDoc آمن.
 * أي قيمة غير صالحة تُستبدل بمستند فارغ بدل إسقاط الشاشة.
 */
export function parseTiptap(content: string | null | undefined): TiptapDoc | null {
  if (!content) {
    return null;
  }
  try {
    const parsed = JSON.parse(content) as unknown;
    if (parsed && typeof parsed === "object" && (parsed as { type?: unknown }).type === "doc") {
      return parsed as TiptapDoc;
    }
  } catch {
    /* محتوى قديم غير JSON — يُعامل كمستند فارغ. */
  }
  return { type: "doc", content: [] };
}

import type { LabKind } from "../engine/types";

/**
 * نموذج محتوى الفقرة — محاكاة لشكل TipTap الذي يعيده الباك
 * (`ParagraphResource.content` = JSON بعد `json_decode`).
 *
 * الهدف: إثبات أن المختبر 3D يمكن أن يكون **عقدة داخل نص الفقرة**،
 * تماماً كما تُرسم عقدة `diagram` في `components/shared/rich-lesson-content`.
 * في المنصة تصل هذه العقدة من المحرر؛ هنا ثابتة داخل المستودع.
 */

export interface SandboxInlineNode {
  type: "text";
  text: string;
  marks?: Array<"bold" | "italic">;
}

export type SandboxInlineContent = SandboxInlineNode[];

export interface SandboxParagraphNode {
  type: "paragraph";
  content?: SandboxInlineContent;
}

export interface SandboxHeadingNode {
  type: "heading";
  attrs?: { level?: 2 | 3 };
  content?: SandboxInlineContent;
}

export interface SandboxListItemNode {
  type: "listItem";
  content?: SandboxBlockNode[];
}

export interface SandboxListNode {
  type: "bulletList" | "orderedList";
  content?: SandboxListItemNode[];
}

export interface SandboxBlockquoteNode {
  type: "blockquote";
  content?: SandboxBlockNode[];
}

/** العقدة الجديدة: مختبر تفاعلي وسط نص الفقرة — النظير الحقيقي لعقدة `diagram` */
export type SandboxLabRef =
  | { labKind: LabKind; sceneId?: never }
  | { labKind: "scene"; sceneId: string };

export interface SandboxInteractiveLabNode {
  type: "interactive_lab";
  attrs: SandboxLabRef & {
    /** سطر شرح يظهر أسفل المشهد داخل النص */
    caption?: string | null;
  };
}

export type SandboxBlockNode =
  | SandboxParagraphNode
  | SandboxHeadingNode
  | SandboxListNode
  | SandboxBlockquoteNode
  | SandboxInteractiveLabNode;

export interface SandboxDoc {
  type: "doc";
  content: SandboxBlockNode[];
}

/** كل عقد المختبر في الفقرة (الفقرة قد تحمل أكثر من مختبر) */
export function findLabNodes(doc: SandboxDoc): SandboxInteractiveLabNode[] {
  const found: SandboxInteractiveLabNode[] = [];

  const walk = (nodes: SandboxBlockNode[]) => {
    for (const node of nodes) {
      if (node.type === "interactive_lab") {
        found.push(node);
        continue;
      }
      if (node.type === "blockquote") walk(node.content ?? []);
      if (node.type === "bulletList" || node.type === "orderedList") {
        for (const item of node.content ?? []) walk(item.content ?? []);
      }
    }
  };

  walk(doc.content);
  return found;
}

/** هل تحتوي الفقرة على مختبر؟ (لإظهار أدوات المقارنة في الدرس) */
export function hasLab(doc: SandboxDoc): boolean {
  return findLabNodes(doc).length > 0;
}

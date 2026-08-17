/**
 * أنواع مستند TipTap (JSON) المخزّن في الباك لمحتوى الفقرات.
 * تُستخدم في محرك الطالب ومحرر المعلم ومعاينات الرحلة.
 */

export interface TiptapTextMark {
  type: "bold" | "italic" | "strike";
}

export interface TiptapTextNode {
  type: "text";
  text?: string;
  marks?: TiptapTextMark[];
}

export interface TiptapParagraphNode {
  type: "paragraph";
  content?: TiptapInlineNode[];
}

export interface TiptapHeadingNode {
  type: "heading";
  attrs?: { level?: number };
  content?: TiptapInlineNode[];
}

export interface TiptapListItemNode {
  type: "listItem";
  content?: TiptapInlineNode[];
}

export interface TiptapListNode {
  type: "bulletList" | "orderedList";
  content?: TiptapListItemNode[];
}

export interface TiptapBlockquoteNode {
  type: "blockquote";
  content?: TiptapInlineNode[];
}

export interface TiptapHardBreakNode {
  type: "hardBreak";
}

export interface TiptapDiagramNode {
  type: "diagram";
  attrs?: { content?: string };
}

export type TiptapInlineNode = TiptapTextNode | TiptapParagraphNode;

export type TiptapBlockNode =
  | TiptapParagraphNode
  | TiptapHeadingNode
  | TiptapListNode
  | TiptapBlockquoteNode
  | TiptapHardBreakNode
  | TiptapDiagramNode;

export interface TiptapDoc {
  type: "doc";
  content?: TiptapBlockNode[];
}
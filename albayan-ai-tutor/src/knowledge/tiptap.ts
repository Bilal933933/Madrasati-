export interface TipTapTextResult {
  ok: boolean;
  text: string;
}

/**
 * يستخرج النص المسطح من مستند TipTap/ProseMirror (JSON).
 * يدعم: doc, paragraph, text, bulletList, listItem, orderedList, blockquote,
 * ويعالج عقدًا مستقبلية محتملة (heading, codeBlock, hardBreak, image, video)
 * بطريقة دفاعية: تمرير ذاتي عبر content وعدم كسر الحلقة عند عقدة مجهولة.
 */
export function extractTipTapText(content: string): TipTapTextResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, text: '' };
  }

  if (!isRecord(parsed) || parsed.type !== 'doc') {
    return { ok: false, text: '' };
  }

  const parts: string[] = [];
  renderNode(parsed, parts);
  const text = parts.join('').trim();
  return { ok: true, text };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function childrenOf(node: Record<string, unknown>): unknown[] {
  const content = node.content;
  return Array.isArray(content) ? content : [];
}

function renderNode(node: Record<string, unknown>, out: string[]): void {
  const type = isString(node.type) ? node.type : 'unknown';

  switch (type) {
    case 'text': {
      if (isString(node.text)) out.push(node.text);
      return;
    }
    case 'hardBreak': {
      out.push('\n');
      return;
    }
    case 'paragraph':
    case 'heading':
    case 'codeBlock': {
      for (const child of childrenOf(node)) {
        if (isRecord(child)) renderNode(child, out);
      }
      out.push('\n');
      return;
    }
    case 'bulletList': {
      const items = childrenOf(node);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        out.push('• ');
        if (isRecord(item)) renderNode(item, out);
        else if (i < items.length - 1) out.push('\n');
      }
      out.push('\n');
      return;
    }
    case 'orderedList': {
      const items = childrenOf(node);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        out.push(`${i + 1}. `);
        if (isRecord(item)) renderNode(item, out);
        else if (i < items.length - 1) out.push('\n');
      }
      out.push('\n');
      return;
    }
    case 'listItem': {
      for (const child of childrenOf(node)) {
        if (isRecord(child)) renderNode(child, out);
      }
      out.push('\n');
      return;
    }
    case 'blockquote': {
      for (const child of childrenOf(node)) {
        if (isRecord(child)) renderNode(child, out);
      }
      out.push('\n');
      return;
    }
    case 'image':
    case 'video':
    case 'horizontalRule': {
      return;
    }
    case 'table':
    case 'tableRow':
    case 'tableHeaderCell':
    case 'tableCell': {
      for (const child of childrenOf(node)) {
        if (isRecord(child)) renderNode(child, out);
      }
      return;
    }
    default: {
      for (const child of childrenOf(node)) {
        if (isRecord(child)) renderNode(child, out);
      }
      return;
    }
  }
}

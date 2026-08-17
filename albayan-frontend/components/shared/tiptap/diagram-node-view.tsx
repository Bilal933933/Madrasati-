"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Pencil, Trash2 } from "lucide-react";
import { DiagramBlock } from "@/features/ai-tutor/components/diagram-block";
import { Button } from "@/components/ui/button";
import { DiagramDialog } from "./diagram-dialog";

/**
 * عرض عقدة الرسم داخل المحرر: يظهر المخطط مع أزرار تعديل/حذف.
 */
export function DiagramNodeView({
  node,
  selected,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const code = (node.attrs.content as string) ?? "";

  return (
    <NodeViewWrapper data-drag-handle>
      <div
        className={`group relative rounded-xl border p-2 ${
          selected ? "border-ring" : "border-border"
        }`}
      >
        <DiagramBlock code={code} />
        <div className="absolute start-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="تعديل الرسم"
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="حذف الرسم"
            onClick={() => deleteNode()}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <DiagramDialog
        open={editing}
        onOpenChange={setEditing}
        initialCode={code}
        onInsert={(next) => updateAttributes({ content: next })}
      />
    </NodeViewWrapper>
  );
}
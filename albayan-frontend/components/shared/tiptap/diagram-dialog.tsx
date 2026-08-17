"use client";

import { useState } from "react";
import { DiagramBlock } from "@/features/ai-tutor/components/diagram-block";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DiagramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode?: string;
  onInsert: (code: string) => void;
};

const TEMPLATES: Record<string, string> = {
  flowchart: `flowchart TD
    A[بداية] --> B{فهمت؟}
    B -- نعم --> C[المفهوم التالي]
    B -- لا --> D[أعد الشرح]
    D --> B`,
  sequence: `sequenceDiagram
    participant م as المعلّم
    participant ط as الطالب
    م->>ط: اشرح المفهوم
    ط-->>م: سؤال
    م->>ط: إجابة`,
  mindmap: `mindmap
  root((الدرس))
    مفهوم
      تعريف
      مثال
    تمارين
      سؤال 1
      سؤال 2`,
  pie: `pie title توزيع النتائج
    "ممتاز" : 45
    "جيد" : 35
    "مقبول" : 20`,
  gantt: `gantt
    title خطة الأسبوع
    dateFormat YYYY-MM-DD
    section الشرح
    المفهوم :a1, 2026-08-17, 3d
    التمارين :after a1, 2d`,
};

const TEMPLATE_OPTIONS = [
  { value: "flowchart", label: "مخطط انسيابي" },
  { value: "sequence", label: "مخطط تسلسلي" },
  { value: "mindmap", label: "خريطة ذهنية" },
  { value: "pie", label: "دائري" },
  { value: "gantt", label: "جدول زمني" },
];

/**
 * نافذة إدراج/تعديل رسم Mermaid: قالب جاهز أو كود حر مع معاينة حية.
 */
export function DiagramDialog({
  open,
  onOpenChange,
  initialCode,
  onInsert,
}: DiagramDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DiagramForm
          initialCode={initialCode}
          onInsert={onInsert}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}

function DiagramForm({
  initialCode,
  onInsert,
  onClose,
}: {
  initialCode?: string;
  onInsert: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState(
    initialCode?.trim() ? initialCode : TEMPLATES.flowchart
  );

  function applyTemplate(template: string) {
    if (template) {
      setCode(TEMPLATES[template] ?? "");
    }
  }

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>إدراج رسم بياني</DialogTitle>
        <DialogDescription>
          اكتب كود Mermaid أو اختر قالبًا جاهزًا، وسترى المعاينة مباشرة.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <Select onValueChange={applyTemplate}>
          <SelectTrigger aria-label="قالب جاهز" className="w-44">
            <SelectValue placeholder="قالب جاهز…" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          dir="ltr"
          className="min-h-40 font-mono text-xs leading-relaxed"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="flowchart TD&#10;    A --> B"
        />
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-3">
        <DiagramBlock code={code.trim()} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          type="button"
          disabled={!code.trim()}
          onClick={() => {
            onInsert(code.trim());
            onClose();
          }}
        >
          إدراج
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
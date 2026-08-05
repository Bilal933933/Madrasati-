"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { useAddBlock } from "../hooks/useLessonFlow";
import type { LessonBlockKind } from "../types/lesson-builder.types";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

type AddBlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: number;
  kind: LessonBlockKind;
  paragraphs: Paragraph[];
};

export function AddBlockDialog({
  open,
  onOpenChange,
  lessonId,
  kind,
  paragraphs,
}: AddBlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <AddBlockForm
            key={kind}
            lessonId={lessonId}
            kind={kind}
            paragraphs={paragraphs}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

const TITLES: Record<string, { title: string; description: string }> = {
  paragraph: {
    title: "إضافة فقرة",
    description: "أنشئ فقرة جديدة داخل رحلة هذا الدرس — عنوانًا وشرحًا وصورةً وريلًا.",
  },
  pre_assessment: {
    title: "إضافة تقييم قبلي",
    description: "تقييم يدخل به الطالب إلى الدرس لقياس فهمه السابق.",
  },
  formative_assessment: {
    title: "إضافة تقييم تكويني",
    description: "تقييم قصير يلي فقرة معينة لقياس الفهم لحظيًا.",
  },
  final_assessment: {
    title: "إضافة تقييم نهائي",
    description: "تقييم ختامي يقيس إتقان الدرس بالكامل.",
  },
};

function AddBlockForm({
  lessonId,
  kind,
  paragraphs,
  onClose,
}: {
  lessonId: number;
  kind: LessonBlockKind;
  paragraphs: Paragraph[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    paragraph_id: "",
  });
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const addBlock = useAddBlock(lessonId);
  const isParagraph = kind === "paragraph";
  const isFormative = kind === "formative_assessment";
  const meta = TITLES[kind] ?? TITLES.paragraph;

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => {
      if (!prev || prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function fieldError(field: string) {
    return { message: serverErrors?.[field]?.[0] };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    addBlock.mutate(
      {
        block_kind: kind,
        title: isParagraph ? form.title.trim() : form.title.trim() || null,
        content: isParagraph ? form.content.trim() : null,
        paragraph_id: isFormative && form.paragraph_id ? Number(form.paragraph_id) : null,
      },
      {
        onSuccess: () => onClose(),
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      }
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{meta.title}</DialogTitle>
        <DialogDescription>{meta.description}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="block-title">العنوان *</FieldLabel>
          <FieldContent>
            <Input
              id="block-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              placeholder={isParagraph ? "مثال: التعريف بالمفعول به" : "عنوان التقييم"}
              className="h-9"
            />
            <FieldError errors={[fieldError("title")]} />
          </FieldContent>
        </Field>

        {isFormative && (
          <Field>
            <FieldLabel htmlFor="block-paragraph">الفقرة المرتبطة</FieldLabel>
            <FieldContent>
              <Select
                value={form.paragraph_id || "none"}
                onValueChange={(value) =>
                  handleChange("paragraph_id", value === "none" ? "" : value)
                }
              >
                <SelectTrigger id="block-paragraph" className="w-full">
                  <SelectValue placeholder="اختر الفقرة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فقرة</SelectItem>
                  {paragraphs.map((paragraph) => (
                    <SelectItem key={paragraph.id} value={String(paragraph.id)}>
                      {paragraph.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                التقييم التكويني يلي الفقرة التي تختارها داخل رحلة الدرس.
              </p>
              <FieldError errors={[fieldError("paragraph_id")]} />
            </FieldContent>
          </Field>
        )}

        {isParagraph && (
          <Field>
            <FieldLabel htmlFor="block-content">محتوى الفقرة *</FieldLabel>
            <FieldContent>
              <div className="overflow-hidden rounded-lg border border-input">
                <RichTextEditor
                  id="block-content"
                  value={form.content}
                  onValueChange={(value) => handleChange("content", value)}
                  placeholder="اكتب شرح الفقرة هنا، مع إمكانية التنسيق (عناوين، قوائم، اقتباس)..."
                />
              </div>
              <FieldError errors={[fieldError("content")]} />
            </FieldContent>
          </Field>
        )}

        {serverErrors && Object.keys(serverErrors).length > 0 && (
          <FieldError errors={Object.values(serverErrors).map((msg) => ({ message: msg?.[0] }))} />
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={addBlock.isPending}>
            إلغاء
          </Button>
          <Button type="submit" disabled={addBlock.isPending}>
            {addBlock.isPending && <Spinner />}
            {addBlock.isPending ? "جارٍ الإضافة..." : "إضافة"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
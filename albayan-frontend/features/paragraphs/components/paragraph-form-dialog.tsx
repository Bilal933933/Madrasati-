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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/shared/image-upload";
import { VideoUrlField } from "@/components/shared/video-url-field";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import {
  useCreateParagraph,
  useNextParagraphOrder,
  useUpdateParagraph,
} from "@/features/paragraphs/hooks/useParagraphs";
import type { Paragraph, ParagraphPayload } from "@/features/paragraphs/types/paragraph.types";

type ParagraphFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paragraph: Paragraph | null;
  lessonId: number;
};

type FormState = {
  title: string;
  content: string;
  image: string;
  video: string;
  sort_order: string;
};

export function ParagraphFormDialog({
  open,
  onOpenChange,
  paragraph,
  lessonId,
}: ParagraphFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <ParagraphForm
            key={paragraph?.id ?? "create"}
            paragraph={paragraph}
            lessonId={lessonId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ParagraphForm({
  paragraph,
  lessonId,
  onClose,
}: {
  paragraph: Paragraph | null;
  lessonId: number;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    title: paragraph?.title ?? "",
    content: paragraph?.content ?? "",
    image: paragraph?.image ?? "",
    video: paragraph?.video ?? "",
    sort_order: paragraph ? String(paragraph.sort_order ?? 0) : "",
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createParagraph = useCreateParagraph();
  const updateParagraph = useUpdateParagraph();
  const isPending = createParagraph.isPending || updateParagraph.isPending;

  const isEdit = paragraph !== null;
  const nextOrder = useNextParagraphOrder(!isEdit, lessonId);

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : nextOrder.data
        ? String(nextOrder.data.data.next_order)
        : "";

  function handleChange(field: keyof FormState, value: string) {
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

  function buildPayload(): ParagraphPayload {
    return {
      lesson_id: lessonId,
      title: form.title.trim(),
      content: form.content.trim(),
      image: form.image.trim() || null,
      video: form.video.trim() || null,
      sort_order: form.sort_order === "" ? (nextOrder.data?.data.next_order ?? 0) : Number(form.sort_order),
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();
    const onSuccess = () => onClose();
    const onError = (error: unknown) =>
      setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null);

    if (isEdit && paragraph) {
      updateParagraph.mutate({ id: paragraph.id, payload }, { onSuccess, onError });
    } else {
      createParagraph.mutate(payload, { onSuccess, onError });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل الفقرة" : "إضافة فقرة"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل عنوان الفقرة ومحتواها ثم احفظ التغييرات."
            : "أدخل بيانات الفقرة الجديدة ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="paragraph-title">عنوان الفقرة *</FieldLabel>
          <FieldContent>
            <Input
              id="paragraph-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("title")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="paragraph-content">المحتوى *</FieldLabel>
          <FieldContent>
            <div className="overflow-hidden rounded-lg border border-input">
              <RichTextEditor
                id="paragraph-content"
                value={form.content}
                onValueChange={(value) => handleChange("content", value)}
                placeholder="اكتب محتوى الفقرة هنا، مع إمكانية التنسيق (عناوين، قوائم، اقتباس)..."
              />
            </div>
            <FieldError errors={[fieldError("content")]} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="paragraph-image">الصورة</FieldLabel>
            <FieldContent>
              <ImageUpload
                id="paragraph-image"
                value={form.image}
                onValueChange={(value) => handleChange("image", value)}
              />
              <FieldError errors={[fieldError("image")]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="paragraph-order">الترتيب</FieldLabel>
            <FieldContent>
              <Input
                id="paragraph-order"
                type="number"
                min={0}
                value={sortOrderValue}
                onChange={(e) => handleChange("sort_order", e.target.value)}
                className="h-9"
              />
              <FieldError errors={[fieldError("sort_order")]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="paragraph-video">فيديو يوتيوب</FieldLabel>
          <FieldContent>
            <VideoUrlField
              id="paragraph-video"
              value={form.video}
              onValueChange={(value) => handleChange("video", value)}
            />
            <FieldError errors={[fieldError("video")]} />
          </FieldContent>
        </Field>

        {serverErrors && Object.keys(serverErrors).length > 0 && (
          <FieldError errors={Object.values(serverErrors).map((msg) => ({ message: msg?.[0] }))} />
        )}

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            {isPending ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

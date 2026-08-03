"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { IconSelect } from "@/components/shared/icon-select";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateStage, useUpdateStage, useNextStageOrder } from "@/features/stages/hooks/useStages";
import type { Stage, StagePayload } from "@/features/stages/types/stage.types";

type StageFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: Stage | null;
};

const emptyForm = {
  name: "",
  slug: "",
  image: "",
  icon: "",
  color: "#2563EB",
  sort_order: "",
  is_published: true,
};

export function StageFormDialog({ open, onOpenChange, stage }: StageFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <StageForm
            key={stage?.id ?? "create"}
            stage={stage}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function StageForm({
  stage,
  onClose,
}: {
  stage: Stage | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState(() =>
    stage
      ? {
          name: stage.name,
          slug: stage.slug ?? "",
          image: stage.image ?? "",
          icon: stage.icon ?? "",
          color: stage.color ?? "#2563EB",
          sort_order: String(stage.sort_order ?? 0),
          is_published: stage.is_published ?? true,
        }
      : emptyForm
  );
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const isPending = createStage.isPending || updateStage.isPending;

  const isEdit = stage !== null;
  const nextOrder = useNextStageOrder(!isEdit);

  const sortOrderValue =
    form.sort_order === ""
      ? nextOrder.data
        ? String(nextOrder.data.data.next_order)
        : ""
      : form.sort_order;

  function handleChange(field: keyof typeof emptyForm, value: string | boolean) {
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

  function buildPayload(): StagePayload {
    return {
      name: form.name.trim(),
      slug: form.slug.trim() || null,
      image: form.image.trim() || null,
      icon: form.icon.trim() || null,
      color: form.color.trim() || null,
      sort_order: form.sort_order === "" ? (nextOrder.data?.data.next_order ?? 0) : Number(form.sort_order),
      is_published: form.is_published,
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();

    const onSuccess = () => onClose();

    if (isEdit && stage) {
      updateStage.mutate(
        { id: stage.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createStage.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل المرحلة" : "إضافة مرحلة"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات المرحلة ثم احفظ التغييرات."
            : "أدخل بيانات المرحلة الجديدة ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="stage-name">اسم المرحلة *</FieldLabel>
          <FieldContent>
            <Input
              id="stage-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("name")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="stage-slug">الرابط (Slug)</FieldLabel>
          <FieldContent>
            <Input
              id="stage-slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="stage-name"
              className="h-9 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              اتركه فارغًا ليولَّد تلقائيًا من الاسم.
            </p>
            <FieldError errors={[fieldError("slug")]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="stage-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <IconSelect
                id="stage-icon"
                value={form.icon}
                onValueChange={(value) => handleChange("icon", value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="stage-color">اللون</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id="stage-color"
                  type="color"
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
                <Input
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="#2563EB"
                  className="h-9 font-mono text-xs"
                />
              </div>
              <FieldError errors={[fieldError("color")]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="stage-image">الصورة</FieldLabel>
          <FieldContent>
            <ImageUpload
              id="stage-image"
              value={form.image}
              onValueChange={(value) => handleChange("image", value)}
            />
            <FieldError errors={[fieldError("image")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="stage-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="stage-order"
              type="number"
              min={0}
              value={sortOrderValue}
              onChange={(e) => handleChange("sort_order", e.target.value)}
              className="h-9"
            />
            <FieldError errors={[fieldError("sort_order")]} />
          </FieldContent>
        </Field>

        <Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={form.is_published}
              onCheckedChange={(checked) => handleChange("is_published", checked === true)}
            />
            منشور
          </label>
        </Field>

        {serverErrors && (Object.keys(serverErrors).length > 0) && (
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

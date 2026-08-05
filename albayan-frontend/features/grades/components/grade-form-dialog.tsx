"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { showApiError } from "@/lib/apiErrors";
import { useCreateGrade, useUpdateGrade, useNextGradeOrder } from "@/features/grades/hooks/useGrades";
import type { Grade, GradePayload } from "@/features/grades/types/grade.types";
import type { Stage } from "@/features/stages/types/stage.types";

type GradeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
  stages: Stage[];
  defaultStageId?: number;
};

type FormState = {
  stage_id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
  color: string;
  sort_order: string;
  is_published: boolean;
};

export function GradeFormDialog({ open, onOpenChange, grade, stages, defaultStageId }: GradeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <GradeForm
            key={grade?.id ?? "create"}
            grade={grade}
            stages={stages}
            defaultStageId={defaultStageId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function GradeForm({
  grade,
  stages,
  defaultStageId,
  onClose,
}: {
  grade: Grade | null;
  stages: Stage[];
  defaultStageId?: number;
  onClose: () => void;
}) {
  const initialStageId = grade ? String(grade.stage_id) : defaultStageId ? String(defaultStageId) : "";
  const [form, setForm] = useState<FormState>(() => ({
    stage_id: initialStageId,
    name: grade?.name ?? "",
    slug: grade?.slug ?? "",
    image: grade?.image ?? "",
    icon: grade?.icon ?? "",
    color: grade?.color ?? "#B08B66",
    sort_order: grade ? String(grade.sort_order ?? 0) : "",
    is_published: grade?.is_published ?? true,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createGrade = useCreateGrade();
  const updateGrade = useUpdateGrade();
  const isPending = createGrade.isPending || updateGrade.isPending;

  const isEdit = grade !== null;
  const stageId = form.stage_id ? Number(form.stage_id) : undefined;
  const nextOrder = useNextGradeOrder(!isEdit, stageId);

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : stageId != null
        ? nextOrder.data
          ? String(nextOrder.data.data.next_order)
          : ""
        : "";

  function handleChange(field: keyof FormState, value: string | boolean) {
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

  function buildPayload(): GradePayload | null {
    const stageId = Number(form.stage_id);
    if (!form.stage_id || Number.isNaN(stageId)) return null;

    return {
      stage_id: stageId,
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
    if (!payload) {
      setServerErrors({ stage_id: ["يرجى اختيار المرحلة."] });
      showApiError({ message: "يرجى اختيار المرحلة." });
      return;
    }

    const onSuccess = () => onClose();

    if (isEdit && grade) {
      updateGrade.mutate(
        { id: grade.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createGrade.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل الصف" : "إضافة صف"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات الصف ثم احفظ التغييرات."
            : "أدخل بيانات الصف الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="grade-stage">المرحلة *</FieldLabel>
          <FieldContent>
            <Select
              value={form.stage_id}
              onValueChange={(value) => handleChange("stage_id", value)}
            >
              <SelectTrigger id="grade-stage" className="w-full">
                <SelectValue placeholder="اختر المرحلة..." />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={String(stage.id)}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldError("stage_id")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="grade-name">اسم الصف *</FieldLabel>
          <FieldContent>
            <Input
              id="grade-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("name")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="grade-slug">الرابط (Slug)</FieldLabel>
          <FieldContent>
            <Input
              id="grade-slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="grade-name"
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
            <FieldLabel htmlFor="grade-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <IconSelect
                id="grade-icon"
                value={form.icon}
                onValueChange={(value) => handleChange("icon", value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="grade-color">اللون</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id="grade-color"
                  type="color"
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
                <Input
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="#B08B66"
                  className="h-9 font-mono text-xs"
                />
              </div>
              <FieldError errors={[fieldError("color")]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="grade-image">الصورة</FieldLabel>
          <FieldContent>
            <ImageUpload
              id="grade-image"
              value={form.image}
              onValueChange={(value) => handleChange("image", value)}
            />
            <FieldError errors={[fieldError("image")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="grade-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="grade-order"
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

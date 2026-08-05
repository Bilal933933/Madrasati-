"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
import { useCreateSubject, useUpdateSubject, useNextSubjectOrder } from "@/features/subjects/hooks/useSubjects";
import type { Subject, SubjectPayload } from "@/features/subjects/types/subject.types";
import type { Grade } from "@/features/grades/types/grade.types";

type SubjectFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  grades: Grade[];
  defaultGradeId?: number;
};

type FormState = {
  grade_id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
  color: string;
  sort_order: string;
  is_published: boolean;
};

export function SubjectFormDialog({ open, onOpenChange, subject, grades, defaultGradeId }: SubjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <SubjectForm
            key={subject?.id ?? "create"}
            subject={subject}
            grades={grades}
            defaultGradeId={defaultGradeId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SubjectForm({
  subject,
  grades,
  defaultGradeId,
  onClose,
}: {
  subject: Subject | null;
  grades: Grade[];
  defaultGradeId?: number;
  onClose: () => void;
}) {
  const initialGradeId = subject ? String(subject.grade_id) : defaultGradeId ? String(defaultGradeId) : "";
  const [form, setForm] = useState<FormState>(() => ({
    grade_id: initialGradeId,
    name: subject?.name ?? "",
    slug: subject?.slug ?? "",
    image: subject?.image ?? "",
    icon: subject?.icon ?? "",
    color: subject?.color ?? "#B08B66",
    sort_order: subject ? String(subject.sort_order ?? 0) : "",
    is_published: subject?.is_published ?? true,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const isPending = createSubject.isPending || updateSubject.isPending;

  const isEdit = subject !== null;
  const gradeId = form.grade_id ? Number(form.grade_id) : undefined;
  const nextOrder = useNextSubjectOrder(!isEdit, gradeId);

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : gradeId != null
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

  function buildPayload(): SubjectPayload | null {
    const gradeId = Number(form.grade_id);
    if (!form.grade_id || Number.isNaN(gradeId)) return null;

    return {
      grade_id: gradeId,
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
      setServerErrors({ grade_id: ["يرجى اختيار الصف."] });
      showApiError({ message: "يرجى اختيار الصف." });
      return;
    }

    const onSuccess = () => onClose();

    if (isEdit && subject) {
      updateSubject.mutate(
        { id: subject.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createSubject.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل المادة" : "إضافة مادة"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات المادة ثم احفظ التغييرات."
            : "أدخل بيانات المادة الجديدة ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="subject-grade">الصف *</FieldLabel>
          <FieldContent>
            <NativeSelect
              id="subject-grade"
              value={form.grade_id}
              onChange={(e) => handleChange("grade_id", e.target.value)}
              className="w-full"
              data-size="default"
            >
              <NativeSelectOption value="" disabled>
                اختر الصف...
              </NativeSelectOption>
              {grades.map((grade) => (
                <NativeSelectOption key={grade.id} value={String(grade.id)}>
                  {grade.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[fieldError("grade_id")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="subject-name">اسم المادة *</FieldLabel>
          <FieldContent>
            <Input
              id="subject-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("name")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="subject-slug">الرابط (Slug)</FieldLabel>
          <FieldContent>
            <Input
              id="subject-slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="subject-name"
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
            <FieldLabel htmlFor="subject-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <IconSelect
                id="subject-icon"
                value={form.icon}
                onValueChange={(value) => handleChange("icon", value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="subject-color">اللون</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id="subject-color"
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
          <FieldLabel htmlFor="subject-image">الصورة</FieldLabel>
          <FieldContent>
            <ImageUpload
              id="subject-image"
              value={form.image}
              onValueChange={(value) => handleChange("image", value)}
            />
            <FieldError errors={[fieldError("image")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="subject-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="subject-order"
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

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSection, useUpdateSection } from "@/features/sections/hooks/useSections";
import type { Section, SectionPayload } from "@/features/sections/types/section.types";
import type { Subject } from "@/features/subjects/types/subject.types";

type SectionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
  subjects: Subject[];
  defaultSubjectId?: number;
};

type FormState = {
  subject_id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
  color: string;
  sort_order: string;
  is_published: boolean;
};

export function SectionFormDialog({ open, onOpenChange, section, subjects, defaultSubjectId }: SectionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <SectionForm
            key={section?.id ?? "create"}
            section={section}
            subjects={subjects}
            defaultSubjectId={defaultSubjectId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionForm({
  section,
  subjects,
  defaultSubjectId,
  onClose,
}: {
  section: Section | null;
  subjects: Subject[];
  defaultSubjectId?: number;
  onClose: () => void;
}) {
  const initialSubjectId = section ? String(section.subject_id) : defaultSubjectId ? String(defaultSubjectId) : "";
  const [form, setForm] = useState<FormState>(() => ({
    subject_id: initialSubjectId,
    name: section?.name ?? "",
    slug: section?.slug ?? "",
    image: section?.image ?? "",
    icon: section?.icon ?? "",
    color: section?.color ?? "#2563EB",
    sort_order: String(section?.sort_order ?? 0),
    is_published: section?.is_published ?? true,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const isPending = createSection.isPending || updateSection.isPending;

  const isEdit = section !== null;

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

  function buildPayload(): SectionPayload | null {
    const subjectId = Number(form.subject_id);
    if (!form.subject_id || Number.isNaN(subjectId)) return null;

    return {
      subject_id: subjectId,
      name: form.name.trim(),
      slug: form.slug.trim() || null,
      image: form.image.trim() || null,
      icon: form.icon.trim() || null,
      color: form.color.trim() || null,
      sort_order: form.sort_order === "" ? null : Number(form.sort_order),
      is_published: form.is_published,
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();
    if (!payload) {
      setServerErrors({ subject_id: ["يرجى اختيار المادة."] });
      return;
    }

    const onSuccess = () => onClose();

    if (isEdit && section) {
      updateSection.mutate(
        { id: section.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createSection.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل الوحدة" : "إضافة وحدة"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات الوحدة ثم احفظ التغييرات."
            : "أدخل بيانات الوحدة الجديدة ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="section-subject">المادة *</FieldLabel>
          <FieldContent>
            <NativeSelect
              id="section-subject"
              value={form.subject_id}
              onChange={(e) => handleChange("subject_id", e.target.value)}
              className="w-full"
              data-size="default"
            >
              <NativeSelectOption value="" disabled>
                اختر المادة...
              </NativeSelectOption>
              {subjects.map((subject) => (
                <NativeSelectOption key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[fieldError("subject_id")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="section-name">اسم الوحدة *</FieldLabel>
          <FieldContent>
            <Input
              id="section-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("name")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="section-slug">الرابط (Slug)</FieldLabel>
          <FieldContent>
            <Input
              id="section-slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="section-name"
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
            <FieldLabel htmlFor="section-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <Input
                id="section-icon"
                value={form.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="book"
                className="h-9"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="section-color">اللون</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id="section-color"
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
          <FieldLabel htmlFor="section-image">رابط الصورة</FieldLabel>
          <FieldContent>
            <Input
              id="section-image"
              type="url"
              value={form.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://example.com/image.png"
              className="h-9"
            />
            <FieldError errors={[fieldError("image")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="section-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="section-order"
              type="number"
              min={0}
              value={form.sort_order}
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

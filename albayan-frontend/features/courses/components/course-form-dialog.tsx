"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateCourse, useUpdateCourse, useNextCourseOrder } from "@/features/courses/hooks/useCourses";
import type { Course, CoursePayload } from "@/features/courses/types/course.types";
import type { Section } from "@/features/sections/types/section.types";

type CourseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  sections: Section[];
  defaultSectionId?: number;
};

type FormState = {
  section_id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  sort_order: string;
  is_published: boolean;
};

export function CourseFormDialog({ open, onOpenChange, course, sections, defaultSectionId }: CourseFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <CourseForm
            key={course?.id ?? "create"}
            course={course}
            sections={sections}
            defaultSectionId={defaultSectionId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CourseForm({
  course,
  sections,
  defaultSectionId,
  onClose,
}: {
  course: Course | null;
  sections: Section[];
  defaultSectionId?: number;
  onClose: () => void;
}) {
  const initialSectionId = course ? String(course.section_id) : defaultSectionId ? String(defaultSectionId) : "";
  const [form, setForm] = useState<FormState>(() => ({
    section_id: initialSectionId,
    name: course?.name ?? "",
    slug: course?.slug ?? "",
    description: course?.description ?? "",
    image: course?.image ?? "",
    icon: course?.icon ?? "",
    color: course?.color ?? "#2563EB",
    sort_order: course ? String(course.sort_order ?? 0) : "",
    is_published: course?.is_published ?? true,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const isPending = createCourse.isPending || updateCourse.isPending;

  const isEdit = course !== null;
  const sectionId = form.section_id ? Number(form.section_id) : undefined;
  const nextOrder = useNextCourseOrder(!isEdit, sectionId);

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : sectionId != null
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

  function buildPayload(): CoursePayload | null {
    const sectionId = Number(form.section_id);
    if (!form.section_id || Number.isNaN(sectionId)) return null;

    return {
      section_id: sectionId,
      name: form.name.trim(),
      slug: form.slug.trim() || null,
      description: form.description.trim() || null,
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
      setServerErrors({ section_id: ["يرجى اختيار الوحدة."] });
      showApiError({ message: "يرجى اختيار الوحدة." });
      return;
    }

    const onSuccess = () => onClose();

    if (isEdit && course) {
      updateCourse.mutate(
        { id: course.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createCourse.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل المقرر" : "إضافة مقرر"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات المقرر ثم احفظ التغييرات."
            : "أدخل بيانات المقرر الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="course-section">الوحدة *</FieldLabel>
          <FieldContent>
            <NativeSelect
              id="course-section"
              value={form.section_id}
              onChange={(e) => handleChange("section_id", e.target.value)}
              className="w-full"
              data-size="default"
            >
              <NativeSelectOption value="" disabled>
                اختر الوحدة...
              </NativeSelectOption>
              {sections.map((section) => (
                <NativeSelectOption key={section.id} value={String(section.id)}>
                  {section.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[fieldError("section_id")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="course-name">اسم المقرر *</FieldLabel>
          <FieldContent>
            <Input
              id="course-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("name")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="course-description">الوصف</FieldLabel>
          <FieldContent>
            <Textarea
              id="course-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
            <FieldError errors={[fieldError("description")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="course-slug">الرابط (Slug)</FieldLabel>
          <FieldContent>
            <Input
              id="course-slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="course-name"
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
            <FieldLabel htmlFor="course-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <IconSelect
                id="course-icon"
                value={form.icon}
                onValueChange={(value) => handleChange("icon", value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="course-color">اللون</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id="course-color"
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
          <FieldLabel htmlFor="course-image">الصورة</FieldLabel>
          <FieldContent>
            <ImageUpload
              id="course-image"
              value={form.image}
              onValueChange={(value) => handleChange("image", value)}
            />
            <FieldError errors={[fieldError("image")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="course-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="course-order"
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

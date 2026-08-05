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
import { VideoUrlField } from "@/components/shared/video-url-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showApiError } from "@/lib/apiErrors";
import { useCreateLesson, useUpdateLesson, useNextLessonOrder } from "@/features/lessons/hooks/useLessons";
import type { Lesson, LessonPayload } from "@/features/lessons/types/lesson.types";
import type { Course } from "@/features/courses/types/course.types";

type LessonFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
  courses: Course[];
  defaultCourseId?: number;
};

type FormState = {
  course_id: string;
  title: string;
  slug: string;
  summary: string;
  image: string;
  video: string;
  icon: string;
  color: string;
  sort_order: string;
  is_published: boolean;
};

export function LessonFormDialog({ open, onOpenChange, lesson, courses, defaultCourseId }: LessonFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <LessonForm
            key={lesson?.id ?? "create"}
            lesson={lesson}
            courses={courses}
            defaultCourseId={defaultCourseId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LessonForm({
  lesson,
  courses,
  defaultCourseId,
  onClose,
}: {
  lesson: Lesson | null;
  courses: Course[];
  defaultCourseId?: number;
  onClose: () => void;
}) {
  const initialCourseId = lesson ? String(lesson.course_id) : defaultCourseId ? String(defaultCourseId) : "";
  const [form, setForm] = useState<FormState>(() => ({
    course_id: initialCourseId,
    title: lesson?.title ?? "",
    slug: lesson?.slug ?? "",
    summary: lesson?.summary ?? "",
    image: lesson?.image ?? "",
    video: lesson?.video ?? "",
    icon: lesson?.icon ?? "",
    color: lesson?.color ?? "#B08B66",
    sort_order: lesson ? String(lesson.sort_order ?? 0) : "",
    is_published: lesson?.is_published ?? true,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const isPending = createLesson.isPending || updateLesson.isPending;

  const isEdit = lesson !== null;
  const courseId = form.course_id ? Number(form.course_id) : undefined;
  const nextOrder = useNextLessonOrder(!isEdit, courseId);

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : courseId != null
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

  function buildPayload(): LessonPayload | null {
    const courseId = Number(form.course_id);
    if (!form.course_id || Number.isNaN(courseId)) return null;

    return {
      course_id: courseId,
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      summary: form.summary.trim() || null,
      image: form.image.trim() || null,
      video: form.video.trim() || null,
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
      setServerErrors({ course_id: ["يرجى اختيار المقرر."] });
      showApiError({ message: "يرجى اختيار المقرر." });
      return;
    }

    const onSuccess = () => onClose();

    if (isEdit && lesson) {
      updateLesson.mutate(
        { id: lesson.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createLesson.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل الدرس" : "إضافة درس"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات الدرس ثم احفظ التغييرات."
            : "أدخل بيانات الدرس الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="lesson-course">المقرر *</FieldLabel>
          <FieldContent>
            <NativeSelect
              id="lesson-course"
              value={form.course_id}
              onChange={(e) => handleChange("course_id", e.target.value)}
              className="w-full"
              data-size="default"
            >
              <NativeSelectOption value="" disabled>
                اختر المقرر...
              </NativeSelectOption>
              {courses.map((course) => (
                <NativeSelectOption key={course.id} value={String(course.id)}>
                  {course.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[fieldError("course_id")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="lesson-title">عنوان الدرس *</FieldLabel>
          <FieldContent>
            <Input
              id="lesson-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("title")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="lesson-summary">الملخص</FieldLabel>
          <FieldContent>
            <Textarea
              id="lesson-summary"
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              rows={3}
            />
            <FieldError errors={[fieldError("summary")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="lesson-slug">الرابط (Slug)</FieldLabel>
          <FieldContent>
            <Input
              id="lesson-slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="lesson-title"
              className="h-9 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              اتركه فارغًا ليولَّد تلقائيًا من العنوان.
            </p>
            <FieldError errors={[fieldError("slug")]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="lesson-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <IconSelect
                id="lesson-icon"
                value={form.icon}
                onValueChange={(value) => handleChange("icon", value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="lesson-color">اللون</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id="lesson-color"
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
          <FieldLabel htmlFor="lesson-image">الصورة</FieldLabel>
          <FieldContent>
            <ImageUpload
              id="lesson-image"
              value={form.image}
              onValueChange={(value) => handleChange("image", value)}
            />
            <FieldError errors={[fieldError("image")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="lesson-video">فيديو يوتيوب</FieldLabel>
          <FieldContent>
            <VideoUrlField
              id="lesson-video"
              value={form.video}
              onValueChange={(value) => handleChange("video", value)}
            />
            <FieldError errors={[fieldError("video")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="lesson-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="lesson-order"
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

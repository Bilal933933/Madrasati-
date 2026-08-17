"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateExamBlueprint,
  useUpdateExamBlueprint,
} from "@/features/exams/hooks/useExamBlueprints";
import {
  EXAM_TYPE_LABELS,
  type ExamBlueprint,
  type ExamBlueprintPayload,
  type ExamType,
} from "@/features/exams/types/exam.types";
import type { CascadeFilterState } from "@/components/shared/use-cascade-filter";
import type { Lesson } from "@/features/lessons/types/lesson.types";

type ExamBlueprintFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueprint: ExamBlueprint | null;
  filter: CascadeFilterState;
  lessons: Lesson[];
};

type FormState = {
  exam_type: ExamType;
  title: string;
  description: string;
  lesson_id: string;
  course_id: string;
  subject_id: string;
  grade_id: string;
  stage_id: string;
  month_no: string;
  duration_minutes: string;
  attempts_allowed: string;
  easy_count: string;
  medium_count: string;
  hard_count: string;
  pass_threshold_percent: string;
  show_review_after_submit: boolean;
  is_active: boolean;
  requires_completion: boolean;
};

function scopeValue(blueprint: ExamBlueprint | null, field: keyof FormState): string {
  if (!blueprint) return "";
  switch (field) {
    case "lesson_id":
      return blueprint.lesson_id ? String(blueprint.lesson_id) : "";
    case "course_id":
      return blueprint.course_id ? String(blueprint.course_id) : "";
    case "subject_id":
      return blueprint.subject_id ? String(blueprint.subject_id) : "";
    case "grade_id":
      return blueprint.grade_id ? String(blueprint.grade_id) : "";
    case "stage_id":
      return blueprint.stage_id ? String(blueprint.stage_id) : "";
    case "month_no":
      return blueprint.month_no ? String(blueprint.month_no) : "";
    default:
      return "";
  }
}

export function ExamBlueprintFormDialog({
  open,
  onOpenChange,
  blueprint,
  filter,
  lessons,
}: ExamBlueprintFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {open && (
          <ExamBlueprintForm
            key={blueprint?.id ?? "create"}
            blueprint={blueprint}
            filter={filter}
            lessons={lessons}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExamBlueprintForm({
  blueprint,
  filter,
  lessons,
  onClose,
}: {
  blueprint: ExamBlueprint | null;
  filter: CascadeFilterState;
  lessons: Lesson[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    exam_type: blueprint?.exam_type ?? "lesson",
    title: blueprint?.title ?? "",
    description: blueprint?.description ?? "",
    lesson_id: scopeValue(blueprint, "lesson_id"),
    course_id: scopeValue(blueprint, "course_id"),
    subject_id: scopeValue(blueprint, "subject_id"),
    grade_id: scopeValue(blueprint, "grade_id"),
    stage_id: scopeValue(blueprint, "stage_id"),
    month_no: scopeValue(blueprint, "month_no"),
    duration_minutes: blueprint ? String(blueprint.duration_minutes) : "30",
    attempts_allowed: blueprint ? String(blueprint.attempts_allowed) : "2",
    easy_count: blueprint ? String(blueprint.easy_count) : "",
    medium_count: blueprint ? String(blueprint.medium_count) : "",
    hard_count: blueprint ? String(blueprint.hard_count) : "",
    pass_threshold_percent: blueprint ? String(blueprint.pass_threshold_percent) : "50",
    show_review_after_submit: blueprint?.show_review_after_submit ?? true,
    is_active: blueprint?.is_active ?? true,
    requires_completion: blueprint?.requires_completion ?? false,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createBlueprint = useCreateExamBlueprint();
  const updateBlueprint = useUpdateExamBlueprint();
  const isPending = createBlueprint.isPending || updateBlueprint.isPending;

  const isEdit = blueprint !== null;

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

  function intValue(value: string, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && value !== "" ? parsed : fallback;
  }

  function buildPayload(): ExamBlueprintPayload | null {
    const payload: ExamBlueprintPayload = {
      exam_type: form.exam_type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      duration_minutes: intValue(form.duration_minutes, 30),
      attempts_allowed: intValue(form.attempts_allowed, 2),
      easy_count: intValue(form.easy_count),
      medium_count: intValue(form.medium_count),
      hard_count: intValue(form.hard_count),
      pass_threshold_percent: intValue(form.pass_threshold_percent, 50),
      show_review_after_submit: form.show_review_after_submit,
      is_active: form.is_active,
      requires_completion: form.requires_completion,
    };

    switch (form.exam_type) {
      case "lesson":
        if (!form.lesson_id) {
          setServerErrors({ lesson_id: ["امتحان الدرس يتطلب تحديد درس."] });
          return null;
        }
        payload.lesson_id = intValue(form.lesson_id);
        break;
      case "unit":
        if (!form.course_id) {
          setServerErrors({ course_id: ["امتحان الوحدة يتطلب تحديد مقرر."] });
          return null;
        }
        payload.course_id = intValue(form.course_id);
        break;
      case "monthly":
        if (!form.subject_id) {
          setServerErrors({ subject_id: ["الامتحان الشهري يتطلب تحديد مادة."] });
          return null;
        }
        if (!form.month_no) {
          setServerErrors({ month_no: ["الامتحان الشهري يتطلب تحديد الشهر."] });
          return null;
        }
        payload.subject_id = intValue(form.subject_id);
        payload.month_no = intValue(form.month_no);
        break;
      case "semester":
        if (!form.subject_id) {
          setServerErrors({ subject_id: ["الامتحان الفصلي يتطلب تحديد مادة."] });
          return null;
        }
        payload.subject_id = intValue(form.subject_id);
        break;
      case "full":
        if (!form.grade_id && !form.stage_id) {
          setServerErrors({ grade_id: ["الامتحان الشامل يتطلب تحديد صف أو مرحلة."] });
          return null;
        }
        if (form.grade_id) payload.grade_id = intValue(form.grade_id);
        if (form.stage_id) payload.stage_id = intValue(form.stage_id);
        break;
    }

    if (!payload.title) {
      setServerErrors({ title: ["عنوان الامتحان مطلوب."] });
      return null;
    }

    return payload;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();
    if (!payload) return;

    const onSuccess = () => onClose();

    if (isEdit && blueprint) {
      updateBlueprint.mutate(
        { id: blueprint.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createBlueprint.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  const courseOptions = filter.options.course;
  const subjectOptions = filter.options.subject;
  const gradeOptions = filter.options.grade;
  const stageOptions = filter.options.stage;
  const lessonOptions = lessons;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل تعريف الامتحان" : "إضافة تعريف امتحان"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات الامتحان ونطاقه ثم احفظ التغييرات."
            : "حدد نوع الامتحان ونطاقه وعدد الأسئلة ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="blueprint-type">نوع الامتحان *</FieldLabel>
          <FieldContent>
            <Select
              value={form.exam_type}
              onValueChange={(value) => handleChange("exam_type", value as ExamType)}
            >
              <SelectTrigger id="blueprint-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {EXAM_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldError("exam_type")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="blueprint-title">عنوان الامتحان *</FieldLabel>
          <FieldContent>
            <Input
              id="blueprint-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("title")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="blueprint-description">الوصف</FieldLabel>
          <FieldContent>
            <Textarea
              id="blueprint-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
            />
            <FieldError errors={[fieldError("description")]} />
          </FieldContent>
        </Field>

        {form.exam_type === "lesson" && (
          <Field>
            <FieldLabel htmlFor="blueprint-lesson">الدرس *</FieldLabel>
            <FieldContent>
              <Select
                value={form.lesson_id}
                onValueChange={(value) => handleChange("lesson_id", value)}
              >
                <SelectTrigger id="blueprint-lesson" className="w-full">
                  <SelectValue placeholder="اختر الدرس..." />
                </SelectTrigger>
                <SelectContent>
                  {lessonOptions.map((lesson) => (
                    <SelectItem key={lesson.id} value={String(lesson.id)}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("lesson_id")]} />
            </FieldContent>
          </Field>
        )}

        {form.exam_type === "unit" && (
          <Field>
            <FieldLabel htmlFor="blueprint-course">المقرر (الوحدة) *</FieldLabel>
            <FieldContent>
              <Select
                value={form.course_id}
                onValueChange={(value) => handleChange("course_id", value)}
              >
                <SelectTrigger id="blueprint-course" className="w-full">
                  <SelectValue placeholder="اختر المقرر..." />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("course_id")]} />
            </FieldContent>
          </Field>
        )}

        {(form.exam_type === "monthly" || form.exam_type === "semester") && (
          <Field>
            <FieldLabel htmlFor="blueprint-subject">المادة *</FieldLabel>
            <FieldContent>
              <Select
                value={form.subject_id}
                onValueChange={(value) => handleChange("subject_id", value)}
              >
                <SelectTrigger id="blueprint-subject" className="w-full">
                  <SelectValue placeholder="اختر المادة..." />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("subject_id")]} />
            </FieldContent>
          </Field>
        )}

        {form.exam_type === "monthly" && (
          <Field>
            <FieldLabel htmlFor="blueprint-month">الشهر *</FieldLabel>
            <FieldContent>
              <Select
                value={form.month_no}
                onValueChange={(value) => handleChange("month_no", value)}
              >
                <SelectTrigger id="blueprint-month" className="w-full">
                  <SelectValue placeholder="اختر الشهر..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      الشهر {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("month_no")]} />
            </FieldContent>
          </Field>
        )}

        {form.exam_type === "full" && (
          <>
            <Field>
              <FieldLabel htmlFor="blueprint-stage">المرحلة</FieldLabel>
              <FieldContent>
                <Select
                  value={form.stage_id}
                  onValueChange={(value) => handleChange("stage_id", value)}
                >
                  <SelectTrigger id="blueprint-stage" className="w-full">
                    <SelectValue placeholder="اختر المرحلة (اختياري)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((stage) => (
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
              <FieldLabel htmlFor="blueprint-grade">الصف</FieldLabel>
              <FieldContent>
                <Select
                  value={form.grade_id}
                  onValueChange={(value) => handleChange("grade_id", value)}
                >
                  <SelectTrigger id="blueprint-grade" className="w-full">
                    <SelectValue placeholder="اختر الصف (اختياري)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.id} value={String(grade.id)}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldError("grade_id")]} />
              </FieldContent>
            </Field>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="blueprint-duration">المدة (دقيقة) *</FieldLabel>
            <FieldContent>
              <Input
                id="blueprint-duration"
                type="number"
                min={1}
                max={600}
                value={form.duration_minutes}
                onChange={(e) => handleChange("duration_minutes", e.target.value)}
                className="h-9"
              />
              <FieldError errors={[fieldError("duration_minutes")]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="blueprint-attempts">المحاولات المسموحة *</FieldLabel>
            <FieldContent>
              <Input
                id="blueprint-attempts"
                type="number"
                min={1}
                max={10}
                value={form.attempts_allowed}
                onChange={(e) => handleChange("attempts_allowed", e.target.value)}
                className="h-9"
              />
              <FieldError errors={[fieldError("attempts_allowed")]} />
            </FieldContent>
          </Field>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">عدد الأسئلة حسب الصعوبة</p>
          <div className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor="blueprint-easy">سهل</FieldLabel>
              <FieldContent>
                <Input
                  id="blueprint-easy"
                  type="number"
                  min={0}
                  value={form.easy_count}
                  onChange={(e) => handleChange("easy_count", e.target.value)}
                  className="h-9"
                />
                <FieldError errors={[fieldError("easy_count")]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="blueprint-medium">متوسط</FieldLabel>
              <FieldContent>
                <Input
                  id="blueprint-medium"
                  type="number"
                  min={0}
                  value={form.medium_count}
                  onChange={(e) => handleChange("medium_count", e.target.value)}
                  className="h-9"
                />
                <FieldError errors={[fieldError("medium_count")]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="blueprint-hard">صعب</FieldLabel>
              <FieldContent>
                <Input
                  id="blueprint-hard"
                  type="number"
                  min={0}
                  value={form.hard_count}
                  onChange={(e) => handleChange("hard_count", e.target.value)}
                  className="h-9"
                />
                <FieldError errors={[fieldError("hard_count")]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="blueprint-threshold">عتبة النجاح (%) *</FieldLabel>
          <FieldContent>
            <Input
              id="blueprint-threshold"
              type="number"
              min={1}
              max={100}
              value={form.pass_threshold_percent}
              onChange={(e) => handleChange("pass_threshold_percent", e.target.value)}
              className="h-9"
            />
            <FieldError errors={[fieldError("pass_threshold_percent")]} />
          </FieldContent>
        </Field>

        <Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={form.show_review_after_submit}
              onCheckedChange={(checked) => handleChange("show_review_after_submit", checked === true)}
            />
            عرض المراجعة بعد التسليم
          </label>
        </Field>

        <Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked === true)}
            />
            مفعّل
          </label>
        </Field>

        <Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={form.requires_completion}
              onCheckedChange={(checked) =>
                handleChange("requires_completion", checked === true)
              }
            />
            يتطلب إكمال دروس النطاق أولًا
          </label>
          <p className="text-xs text-muted-foreground">
            عند تعطيله (الافتراضي) يكون الامتحان متاحًا دون إكمال الدروس.
          </p>
        </Field>

        {serverErrors && Object.keys(serverErrors).length > 0 && (
          <FieldError errors={Object.values(serverErrors).map((msg) => ({ message: msg?.[0] }))} />
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
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
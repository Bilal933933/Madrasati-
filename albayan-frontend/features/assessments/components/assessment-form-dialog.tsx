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
import {
  useCreateAssessment,
  useNextAssessmentOrder,
  useUpdateAssessment,
} from "@/features/assessments/hooks/useAssessments";
import { useParagraphs } from "@/features/paragraphs/hooks/useParagraphs";
import type {
  Assessment,
  AssessmentPayload,
  AssessmentType,
} from "@/features/assessments/types/assessment.types";

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: "pre", label: "مبدئي" },
  { value: "formative", label: "تكويني" },
  { value: "final", label: "ختامي" },
];

type AssessmentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
  lessonId: number;
  lockType?: boolean;
};

type FormState = {
  type: AssessmentType;
  paragraph_id: string;
  title: string;
  sort_order: string;
};

export function AssessmentFormDialog({
  open,
  onOpenChange,
  assessment,
  lessonId,
  lockType = false,
}: AssessmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <AssessmentForm
            key={assessment?.id ?? "create"}
            assessment={assessment}
            lessonId={lessonId}
            lockType={lockType}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssessmentForm({
  assessment,
  lessonId,
  lockType,
  onClose,
}: {
  assessment: Assessment | null;
  lessonId: number;
  lockType?: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    type: assessment?.type ?? "formative",
    paragraph_id: assessment?.paragraph_id != null ? String(assessment.paragraph_id) : "",
    title: assessment?.title ?? "",
    sort_order: assessment ? String(assessment.sort_order ?? 0) : "",
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();
  const isPending = createAssessment.isPending || updateAssessment.isPending;

  const isEdit = assessment !== null;
  const { data: paragraphsData } = useParagraphs({ lessonId });
  const paragraphs = paragraphsData?.data ?? [];
  const nextOrder = useNextAssessmentOrder(!isEdit, lessonId);

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

  function buildPayload(): AssessmentPayload {
    const isFormative = form.type === "formative";
    const paragraphId = form.paragraph_id ? Number(form.paragraph_id) : null;

    return {
      lesson_id: lessonId,
      type: form.type,
      title: form.title.trim() || null,
      paragraph_id: isFormative ? paragraphId : null,
      sort_order:
        form.sort_order === "" ? (nextOrder.data?.data.next_order ?? 0) : Number(form.sort_order),
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();
    const onSuccess = () => onClose();
    const onError = (error: unknown) =>
      setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null);

    if (isEdit && assessment) {
      updateAssessment.mutate({ id: assessment.id, payload }, { onSuccess, onError });
    } else {
      createAssessment.mutate(payload, { onSuccess, onError });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل التقييم" : "إضافة تقييم"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات التقييم ثم احفظ التغييرات."
            : "أدخل بيانات التقييم الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        {!lockType && (
          <Field>
            <FieldLabel htmlFor="assessment-type">نوع التقييم *</FieldLabel>
            <FieldContent>
              <Select
                value={form.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="assessment-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("type")]} />
            </FieldContent>
          </Field>
        )}

        {form.type === "formative" && (
          <Field>
            <FieldLabel htmlFor="assessment-paragraph">الفقرة المرتبطة</FieldLabel>
            <FieldContent>
              <Select
                value={form.paragraph_id || "none"}
                onValueChange={(value) =>
                  handleChange("paragraph_id", value === "none" ? "" : value)
                }
              >
                <SelectTrigger id="assessment-paragraph" className="w-full">
                  <SelectValue />
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
                التكويني يظهر بعد فقرة معينة داخل الدرس.
              </p>
              <FieldError errors={[fieldError("paragraph_id")]} />
            </FieldContent>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="assessment-title">عنوان التقييم</FieldLabel>
          <FieldContent>
            <Input
              id="assessment-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="مثال: اختبار منتصف الفصل"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              اختياري — يُعرض للطالب، ويُولَّد عنوان تلقائي إن تُرك فارغًا.
            </p>
            <FieldError errors={[fieldError("title")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="assessment-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="assessment-order"
              type="number"
              min={0}
              value={sortOrderValue}
              onChange={(e) => handleChange("sort_order", e.target.value)}
              className="h-9"
            />
            <FieldError errors={[fieldError("sort_order")]} />
          </FieldContent>
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

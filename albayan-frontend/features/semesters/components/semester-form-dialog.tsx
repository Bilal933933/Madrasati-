"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { showApiError } from "@/lib/apiErrors";
import { useCreateSemester, useUpdateSemester, useNextSemesterOrder } from "@/features/semesters/hooks/useSemesters";
import type { Semester, SemesterPayload } from "@/features/semesters/types/semester.types";
import type { Grade } from "@/features/grades/types/grade.types";

type SemesterFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: Semester | null;
  grades: Grade[];
  defaultGradeId?: number;
};

type FormState = {
  grade_id: string;
  name: string;
  sort_order: string;
};

export function SemesterFormDialog({ open, onOpenChange, semester, grades, defaultGradeId }: SemesterFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <SemesterForm
            key={semester?.id ?? "create"}
            semester={semester}
            grades={grades}
            defaultGradeId={defaultGradeId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SemesterForm({
  semester,
  grades,
  defaultGradeId,
  onClose,
}: {
  semester: Semester | null;
  grades: Grade[];
  defaultGradeId?: number;
  onClose: () => void;
}) {
  const initialGradeId = semester ? String(semester.grade_id) : defaultGradeId ? String(defaultGradeId) : "";
  const [form, setForm] = useState<FormState>(() => ({
    grade_id: initialGradeId,
    name: semester?.name ?? "",
    sort_order: semester ? String(semester.sort_order ?? 0) : "",
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createSemester = useCreateSemester();
  const updateSemester = useUpdateSemester();
  const isPending = createSemester.isPending || updateSemester.isPending;

  const isEdit = semester !== null;
  const gradeId = form.grade_id ? Number(form.grade_id) : undefined;
  const nextOrder = useNextSemesterOrder(!isEdit, gradeId);

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : gradeId != null
        ? nextOrder.data
          ? String(nextOrder.data.data.next_order)
          : ""
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

  function buildPayload(): SemesterPayload | null {
    const gradeId = Number(form.grade_id);
    if (!form.grade_id || Number.isNaN(gradeId)) return null;

    return {
      grade_id: gradeId,
      name: form.name.trim(),
      sort_order: form.sort_order === "" ? (nextOrder.data?.data.next_order ?? 0) : Number(form.sort_order),
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

    if (isEdit && semester) {
      updateSemester.mutate(
        { id: semester.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createSemester.mutate(payload, {
        onSuccess,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل الفصل" : "إضافة فصل"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات الفصل ثم احفظ التغييرات."
            : "أدخل بيانات الفصل الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="semester-grade">الصف *</FieldLabel>
          <FieldContent>
            <Select
              value={form.grade_id}
              onValueChange={(value) => handleChange("grade_id", value)}
            >
              <SelectTrigger id="semester-grade" className="w-full">
                <SelectValue placeholder="اختر الصف..." />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={String(grade.id)}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldError("grade_id")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="semester-name">اسم الفصل *</FieldLabel>
          <FieldContent>
            <Input
              id="semester-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("name")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="semester-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="semester-order"
              type="number"
              min={0}
              value={sortOrderValue}
              onChange={(e) => handleChange("sort_order", e.target.value)}
              className="h-9"
            />
            <FieldError errors={[fieldError("sort_order")]} />
          </FieldContent>
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

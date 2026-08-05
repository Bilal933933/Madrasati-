"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/apiErrors";
import {
  optionsApi,
  questionsApi,
} from "@/features/assessments/services/assessmentsApi";
import { useNextQuestionOrder } from "@/features/assessments/hooks/useQuestions";
import type {
  Question,
  QuestionPayload,
  QuestionType,
} from "@/features/assessments/types/assessment.types";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "اختيار من متعدد" },
  { value: "true_false", label: "صح وخطأ" },
];

let newOptionCounter = 0;

type OptionDraft = {
  key: string;
  id?: number;
  content: string;
  is_correct: boolean;
  sort_order: number;
};

type QuestionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: number;
  question: Question | null;
};

type FormState = {
  type: QuestionType;
  content: string;
  explanation: string;
  correct_answer: boolean;
  options: OptionDraft[];
  sort_order: string;
};

export function QuestionFormDialog({
  open,
  onOpenChange,
  assessmentId,
  question,
}: QuestionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <QuestionForm
            key={question?.id ?? "create"}
            assessmentId={assessmentId}
            question={question}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuestionForm({
  assessmentId,
  question,
  onClose,
}: {
  assessmentId: number;
  question: Question | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    const options = (question?.options ?? []).map((option, index) => ({
      key: `opt-${option.id}`,
      id: option.id,
      content: option.content,
      is_correct: option.is_correct ?? false,
      sort_order: option.sort_order ?? index + 1,
    }));

    return {
      type: question?.type ?? "mcq",
      content: question?.content ?? "",
      explanation: question?.explanation ?? "",
      correct_answer: question?.correct_answer ?? true,
      options,
      sort_order: question ? String(question.sort_order ?? 0) : "",
    };
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const queryClient = useQueryClient();
  const isEdit = question !== null;
  const nextOrder = useNextQuestionOrder(!isEdit, assessmentId);

  const mutation = useMutation({
    mutationFn: async () => {
      const questionPayload: QuestionPayload = {
        assessment_id: assessmentId,
        type: form.type,
        content: form.content.trim(),
        explanation: form.explanation.trim() || null,
        correct_answer: form.type === "true_false" ? form.correct_answer : null,
        sort_order:
          form.sort_order === "" ? (nextOrder.data?.data.next_order ?? 0) : Number(form.sort_order),
      };

      let savedId = question?.id;
      if (savedId != null) {
        await questionsApi.updateQuestion(savedId, questionPayload);
      } else {
        const response = await questionsApi.createQuestion(questionPayload);
        savedId = response.data.id;
      }

      if (form.type === "mcq") {
        const keptIds = new Set<number>();
        for (const option of form.options) {
          const content = option.content.trim();
          if (!content) continue;

          const optionPayload = {
            question_id: savedId as number,
            content,
            is_correct: option.is_correct,
            sort_order: option.sort_order,
          };

          if (option.id != null) {
            await optionsApi.updateOption(option.id, optionPayload);
            keptIds.add(option.id);
          } else {
            await optionsApi.createOption(optionPayload);
          }
        }

        for (const existing of question?.options ?? []) {
          if (!keptIds.has(existing.id)) {
            await optionsApi.deleteOption(existing.id);
          }
        }
      } else {
        for (const existing of question?.options ?? []) {
          await optionsApi.deleteOption(existing.id);
        }
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "تم تحديث السؤال بنجاح." : "تم إنشاء السؤال بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
      onClose();
    },
    onError: (error) => {
      setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null);
      if (!(error as { errors?: unknown }).errors) {
        toast.error(getErrorMessage(error));
      }
    },
  });

  const sortOrderValue =
    form.sort_order !== ""
      ? form.sort_order
      : nextOrder.data
        ? String(nextOrder.data.data.next_order)
        : "";

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key === field) delete next[key];
      }
      return next;
    });
  }

  function addOption() {
    newOptionCounter += 1;
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          key: `new-${newOptionCounter}`,
          content: "",
          is_correct: prev.options.length === 0,
          sort_order: prev.options.length + 1,
        },
      ],
    }));
  }

  function removeOption(key: string) {
    setForm((prev) => {
      const options = prev.options.filter((option) => option.key !== key);
      return {
        ...prev,
        options: options.map((option, index) => ({ ...option, sort_order: index + 1 })),
      };
    });
  }

  function updateOption(key: string, patch: Partial<OptionDraft>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.key === key ? { ...option, ...patch } : option
      ),
    }));
  }

  const correctOptionKey = form.options.find((option) => option.is_correct)?.key ?? "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setClientError(null);
    setServerErrors(null);

    if (!form.content.trim()) {
      setClientError("نص السؤال مطلوب.");
      return;
    }

    if (form.type === "mcq") {
      const validOptions = form.options.filter((option) => option.content.trim());
      if (validOptions.length === 0) {
        setClientError("أضف خيارًا واحدًا على الأقل.");
        return;
      }
      if (!validOptions.some((option) => option.is_correct)) {
        setClientError("حدّد الإجابة الصحيحة بخيار واحد على الأقل.");
        return;
      }
    }

    mutation.mutate();
  }

  function fieldError(field: string) {
    return { message: serverErrors?.[field]?.[0] };
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل السؤال" : "إضافة سؤال"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل نص السؤال وخياراته ثم احفظ التغييرات."
            : "أدخل نص السؤال وحدّد الخيارات والإجابة الصحيحة."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="question-type">نوع السؤال *</FieldLabel>
          <FieldContent>
            <NativeSelect
              id="question-type"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full"
              data-size="default"
            >
              {QUESTION_TYPES.map((type) => (
                <NativeSelectOption key={type.value} value={type.value}>
                  {type.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[fieldError("type")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="question-content">نص السؤال *</FieldLabel>
          <FieldContent>
            <Textarea
              id="question-content"
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={3}
            />
            <FieldError errors={[fieldError("content")]} />
          </FieldContent>
        </Field>

        {form.type === "mcq" ? (
          <Field>
            <FieldLabel>الخيارات</FieldLabel>
            <FieldContent>
              <RadioGroup
                value={correctOptionKey}
                onValueChange={(key) =>
                  setForm((prev) => ({
                    ...prev,
                    options: prev.options.map((option) => ({
                      ...option,
                      is_correct: option.key === key,
                    })),
                  }))
                }
                className="gap-2"
              >
                {form.options.map((option) => (
                  <div key={option.key} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={option.key}
                      aria-label={`الإجابة الصحيحة للخيار ${option.sort_order}`}
                    />
                    <Input
                      value={option.content}
                      onChange={(e) => updateOption(option.key, { content: e.target.value })}
                      placeholder={`الخيار ${option.sort_order}`}
                      className="h-9 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`حذف الخيار ${option.sort_order}`}
                      disabled={form.options.length <= 1}
                      onClick={() => removeOption(option.key)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus />
                  إضافة خيار
                </Button>
                <p className="text-xs text-muted-foreground">
                  اختر (◉) أمام الخيار الصحيح.
                </p>
              </div>
              <FieldError errors={[fieldError("options")]} />
            </FieldContent>
          </Field>
        ) : (
          <Field>
            <FieldLabel>الإجابة الصحيحة *</FieldLabel>
            <FieldContent>
              <RadioGroup
                value={String(form.correct_answer)}
                onValueChange={(value) => handleChange("correct_answer", value === "true")}
                className="flex-row gap-6"
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value="true" />
                  صح
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value="false" />
                  خطأ
                </label>
              </RadioGroup>
              <FieldError errors={[fieldError("correct_answer")]} />
            </FieldContent>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="question-explanation">التوضيح (يظهر بعد الإجابة)</FieldLabel>
          <FieldContent>
            <Textarea
              id="question-explanation"
              value={form.explanation}
              onChange={(e) => handleChange("explanation", e.target.value)}
              rows={2}
              placeholder="مثال: لأن الضوء ينتقل في خط مستقيم..."
            />
            <FieldError errors={[fieldError("explanation")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="question-order">الترتيب</FieldLabel>
          <FieldContent>
            <Input
              id="question-order"
              type="number"
              min={0}
              value={sortOrderValue}
              onChange={(e) => handleChange("sort_order", e.target.value)}
              className="h-9"
            />
            <FieldError errors={[fieldError("sort_order")]} />
          </FieldContent>
        </Field>

        {clientError && <FieldError errors={[{ message: clientError }]} />}
        {serverErrors && Object.keys(serverErrors).length > 0 && (
          <FieldError errors={Object.values(serverErrors).map((msg) => ({ message: msg?.[0] }))} />
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            إلغاء
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            {mutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

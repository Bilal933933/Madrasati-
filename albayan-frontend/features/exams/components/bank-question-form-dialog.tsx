"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
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
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateBankQuestion,
  useUpdateBankQuestion,
} from "@/features/exams/hooks/useBankQuestions";
import type {
  BankQuestion,
  BankQuestionPayload,
  Difficulty,
  QuestionType,
} from "@/features/exams/types/exam.types";
import type { Lesson } from "@/features/lessons/types/lesson.types";

type BankQuestionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: BankQuestion | null;
  lessons: Lesson[];
  defaultLessonId?: number;
  onCreated?: (question: BankQuestion) => void;
};

type OptionState = { content: string; is_correct: boolean };

type FormState = {
  lesson_id: string;
  type: QuestionType;
  content: string;
  explanation: string;
  difficulty: Difficulty;
  correct_answer: string;
  is_active: boolean;
  options: OptionState[];
};

function initialOptions(question: BankQuestion | null): OptionState[] {
  if (question && question.type === "mcq" && question.options.length > 0) {
    return question.options.map((option) => ({
      content: option.content,
      is_correct: option.is_correct,
    }));
  }
  return [
    { content: "", is_correct: true },
    { content: "", is_correct: false },
  ];
}

export function BankQuestionFormDialog({
  open,
  onOpenChange,
  question,
  lessons,
  defaultLessonId,
  onCreated,
}: BankQuestionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {open && (
          <BankQuestionForm
            key={question?.id ?? "create"}
            question={question}
            lessons={lessons}
            defaultLessonId={defaultLessonId}
            onCreated={onCreated}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BankQuestionForm({
  question,
  lessons,
  defaultLessonId,
  onCreated,
  onClose,
}: {
  question: BankQuestion | null;
  lessons: Lesson[];
  defaultLessonId?: number;
  onCreated?: (question: BankQuestion) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    lesson_id: question ? String(question.lesson_id) : defaultLessonId ? String(defaultLessonId) : "",
    type: question?.type ?? "mcq",
    content: question?.content ?? "",
    explanation: question?.explanation ?? "",
    difficulty: question?.difficulty ?? "medium",
    correct_answer: question?.correct_answer == null ? "" : question.correct_answer ? "true" : "false",
    is_active: question?.is_active ?? true,
    options: initialOptions(question),
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createQuestion = useCreateBankQuestion();
  const updateQuestion = useUpdateBankQuestion();
  const isPending = createQuestion.isPending || updateQuestion.isPending;

  const isEdit = question !== null;

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

  function setOption(index: number, key: keyof OptionState, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index
          ? { ...option, [key]: key === "is_correct" ? value === true : value }
          : option
      ),
    }));
  }

  function addOption() {
    setForm((prev) => ({ ...prev, options: [...prev.options, { content: "", is_correct: false }] }));
  }

  function removeOption(index: number) {
    if (form.options.length <= 2) return;
    setForm((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  }

  function buildPayload(): BankQuestionPayload | null {
    const lessonId = Number(form.lesson_id);
    if (!form.lesson_id || Number.isNaN(lessonId)) return null;
    if (!form.content.trim()) {
      setServerErrors({ content: ["نص السؤال مطلوب."] });
      return null;
    }

    const base: BankQuestionPayload = {
      lesson_id: lessonId,
      type: form.type,
      content: form.content.trim(),
      explanation: form.explanation.trim() || null,
      difficulty: form.difficulty,
      is_active: form.is_active,
    };

    if (form.type === "true_false") {
      if (form.correct_answer === "") {
        setServerErrors({ correct_answer: ["الإجابة الصحيحة مطلوبة."] });
        return null;
      }
      return {
        ...base,
        correct_answer: form.correct_answer === "true",
      };
    }

    const validOptions = form.options
      .map((option) => ({ content: option.content.trim(), is_correct: option.is_correct }))
      .filter((option) => option.content !== "");

    if (validOptions.length < 2) {
      setServerErrors({ options: ["سؤال الاختيار من متعدد يتطلب خيارين على الأقل."] });
      return null;
    }
    if (!validOptions.some((option) => option.is_correct)) {
      setServerErrors({ options: ["يجب تحديد خيار صحيح واحد على الأقل."] });
      return null;
    }

    return { ...base, correct_answer: null, options: validOptions };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();
    if (!payload) return;

    const onSuccess = () => onClose();

    if (isEdit && question) {
      updateQuestion.mutate(
        { id: question.id, payload },
        {
          onSuccess,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createQuestion.mutate(payload, {
        onSuccess: (data) => {
          onCreated?.(data.data);
          onClose();
        },
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل السؤال" : "إضافة سؤال"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات السؤال ثم احفظ التغييرات."
            : "أدخل بيانات السؤال الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <Field>
          <FieldLabel htmlFor="question-lesson">الدرس *</FieldLabel>
          <FieldContent>
            <Select
              value={form.lesson_id}
              onValueChange={(value) => handleChange("lesson_id", value)}
            >
              <SelectTrigger id="question-lesson" className="w-full">
                <SelectValue placeholder="اختر الدرس..." />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={String(lesson.id)}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldError("lesson_id")]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="question-type">النوع *</FieldLabel>
            <FieldContent>
              <Select
                value={form.type}
                onValueChange={(value) => handleChange("type", value as QuestionType)}
              >
                <SelectTrigger id="question-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                  <SelectItem value="true_false">صح وخطأ</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("type")]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="question-difficulty">الصعوبة *</FieldLabel>
            <FieldContent>
              <Select
                value={form.difficulty}
                onValueChange={(value) => handleChange("difficulty", value as Difficulty)}
              >
                <SelectTrigger id="question-difficulty" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">سهل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="hard">صعب</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("difficulty")]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="question-content">نص السؤال *</FieldLabel>
          <FieldContent>
            <Textarea
              id="question-content"
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={3}
              placeholder="اكتب نص السؤال هنا..."
            />
            <FieldError errors={[fieldError("content")]} />
          </FieldContent>
        </Field>

        {form.type === "mcq" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">الخيارات *</p>
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-primary hover:underline"
              >
                <Plus className="size-3.5" />
                إضافة خيار
              </button>
            </div>
            <RadioGroup
              value={String(form.options.findIndex((option) => option.is_correct))}
              onValueChange={(value) => {
                const index = Number(value);
                setForm((prev) => ({
                  ...prev,
                  options: prev.options.map((option, i) => ({
                    ...option,
                    is_correct: i === index,
                  })),
                }));
                setServerErrors((prev) => {
                  if (!prev || prev["options"] === undefined) return prev;
                  const next = { ...prev };
                  delete next["options"];
                  return next;
                });
              }}
              className="gap-2"
            >
              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                  <RadioGroupItem
                    value={String(index)}
                    id={`question-option-${index}`}
                    aria-label={`الخيار الصحيح ${index + 1}`}
                  />
                  <Input
                    value={option.content}
                    onChange={(e) => setOption(index, "content", e.target.value)}
                    placeholder={`الخيار ${index + 1}`}
                    className="h-9"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={form.options.length <= 2}
                    aria-label={`حذف الخيار ${index + 1}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              حدّد الخيار الصحيح بزرّ radio بجواره.
            </p>
            <FieldError errors={[fieldError("options")]} />
          </div>
        ) : (
          <Field>
            <FieldLabel htmlFor="question-answer">الإجابة الصحيحة *</FieldLabel>
            <FieldContent>
              <Select
                value={form.correct_answer}
                onValueChange={(value) => handleChange("correct_answer", value)}
              >
                <SelectTrigger id="question-answer" className="w-full">
                  <SelectValue placeholder="اختر الإجابة..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">صح</SelectItem>
                  <SelectItem value="false">خطأ</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("correct_answer")]} />
            </FieldContent>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="question-explanation">التفسير</FieldLabel>
          <FieldContent>
            <Textarea
              id="question-explanation"
              value={form.explanation}
              onChange={(e) => handleChange("explanation", e.target.value)}
              rows={2}
            />
            <FieldError errors={[fieldError("explanation")]} />
          </FieldContent>
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
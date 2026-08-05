"use client";

import { useState } from "react";
import { ChevronDown, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { RowActions } from "@/components/shared/row-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { useAssessment } from "@/features/assessments/hooks/useAssessments";
import { useDeleteQuestion } from "@/features/assessments/hooks/useQuestions";
import { QuestionFormDialog } from "@/features/assessments/components/question-form-dialog";
import type {
  Assessment,
  AssessmentType,
  Question,
  QuestionType,
} from "@/features/assessments/types/assessment.types";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

type AssessmentsListProps = {
  assessments: Assessment[];
  paragraphs: Paragraph[];
  isLoading: boolean;
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
};

const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  pre: "مبدئي",
  formative: "تكويني",
  final: "ختامي",
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "اختيار من متعدد",
  true_false: "صح وخطأ",
};

function TypeBadge({ type }: { type: AssessmentType }) {
  return (
    <span
      data-slot="badge"
      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
    >
      {ASSESSMENT_TYPE_LABELS[type]}
    </span>
  );
}

function QuestionTypeBadge({ type }: { type: QuestionType }) {
  return (
    <span
      data-slot="badge"
      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
    >
      {QUESTION_TYPE_LABELS[type]}
    </span>
  );
}

export function AssessmentsList({
  assessments,
  paragraphs,
  isLoading,
  onEdit,
  onDelete,
}: AssessmentsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListChecks />
          </EmptyMedia>
          <EmptyTitle>لا توجد تقييمات هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على تقييمات ضمن هذا الدرس. أضف تقييمًا جديدًا.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {assessments.map((assessment) => (
        <AssessmentCard
          key={assessment.id}
          assessment={assessment}
          paragraphs={paragraphs}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function AssessmentCard({
  assessment,
  paragraphs,
  onEdit,
  onDelete,
}: {
  assessment: Assessment;
  paragraphs: Paragraph[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const { data: assessmentData, isLoading: detailLoading } = useAssessment(
    expanded ? assessment.id : null
  );
  const deleteQuestion = useDeleteQuestion();
  const questions = assessmentData?.data.questions ?? [];
  const paragraph = paragraphs.find((p) => p.id === assessment.paragraph_id);

  function openCreateQuestion() {
    setEditingQuestion(null);
    setQuestionFormOpen(true);
  }

  function openEditQuestion(question: Question) {
    setEditingQuestion(question);
    setQuestionFormOpen(true);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <TypeBadge type={assessment.type} />
            <div className="flex flex-col">
              <span className="font-medium">
                {assessment.title ?? `${ASSESSMENT_TYPE_LABELS[assessment.type]} ${assessment.sort_order ?? ""}`}
              </span>
              <span className="text-xs text-muted-foreground">
                الترتيب: {assessment.sort_order ?? "-"}
                {assessment.type === "formative" &&
                  ` · الفقرة: ${paragraph?.title ?? (assessment.paragraph_id ? `#${assessment.paragraph_id}` : "بدون")}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
            >
              <ListChecks />
              الأسئلة
              <ChevronDown
                className={cn("size-4 transition-transform", expanded && "rotate-180")}
              />
            </Button>
            <RowActions
              ariaLabel={`إجراءات ${assessment.title ?? "التقييم"}`}
              items={[
                {
                  key: "edit",
                  label: "تعديل",
                  icon: <Pencil />,
                  onSelect: () => onEdit(assessment),
                },
                {
                  key: "delete",
                  label: "حذف",
                  icon: <Trash2 />,
                  destructive: true,
                  onSelect: () => onDelete(assessment),
                },
              ]}
            />
          </div>
        </div>

        {expanded && (
          <div className="flex flex-col gap-3 border-t border-border p-4">
            {detailLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                لا توجد أسئلة بعد — أضف أول سؤال.
              </p>
            ) : (
              questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={() => openEditQuestion(question)}
                  onDelete={() => setDeletingQuestion(question)}
                />
              ))
            )}

            <div className="mt-1">
              <Button type="button" variant="outline" size="sm" onClick={openCreateQuestion}>
                <Plus />
                إضافة سؤال
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <QuestionFormDialog
        open={questionFormOpen}
        onOpenChange={setQuestionFormOpen}
        assessmentId={assessment.id}
        question={editingQuestion}
      />

      <DeleteDialog
        open={deletingQuestion !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingQuestion(null);
        }}
        title="حذف السؤال"
        description={`هل أنت متأكد من حذف السؤال "${deletingQuestion?.content}"؟`}
        isPending={deleteQuestion.isPending}
        onConfirm={() => {
          if (deletingQuestion) {
            deleteQuestion.mutate(deletingQuestion.id, {
              onSuccess: () => setDeletingQuestion(null),
            });
          }
        }}
      />
    </Card>
  );
}

function QuestionItem({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {index + 1}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{question.content}</span>
            <QuestionTypeBadge type={question.type} />
          </div>
        </div>
        <RowActions
          ariaLabel={`إجراءات السؤال ${index + 1}`}
          items={[
            {
              key: "edit",
              label: "تعديل",
              icon: <Pencil />,
              onSelect: onEdit,
            },
            {
              key: "delete",
              label: "حذف",
              icon: <Trash2 />,
              destructive: true,
              onSelect: onDelete,
            },
          ]}
        />
      </div>

      {question.type === "true_false" ? (
        <p className="mt-2 text-sm">
          الإجابة الصحيحة:{" "}
          <span className={question.correct_answer ? "text-success" : "text-destructive"}>
            {question.correct_answer ? "صح" : "خطأ"}
          </span>
        </p>
      ) : (
        (question.options ?? []).length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {(question.options ?? []).map((option) => (
              <li key={option.id} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-xs",
                    option.is_correct
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {option.is_correct ? "✓" : ""}
                </span>
                <span className={option.is_correct ? "font-medium text-success" : ""}>
                  {option.content}
                </span>
              </li>
            ))}
          </ul>
        )
      )}

      {question.explanation && (
        <p className="mt-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          التوضيح: {question.explanation}
        </p>
      )}
    </div>
  );
}

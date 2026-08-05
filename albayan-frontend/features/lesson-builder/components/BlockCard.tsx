"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Eye,
  EyeOff,
  ListChecks,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { RowActions } from "@/components/shared/row-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ParagraphFormDialog } from "@/features/paragraphs/components/paragraph-form-dialog";
import { AssessmentFormDialog } from "@/features/assessments/components/assessment-form-dialog";
import { QuestionFormDialog } from "@/features/assessments/components/question-form-dialog";
import { useDeleteQuestion } from "@/features/assessments/hooks/useQuestions";
import { useAssessment as useAssessmentDetail } from "@/features/assessments/hooks/useAssessments";
import type { LessonFlowBlock, LessonBlockKind } from "../types/lesson-builder.types";
import type { Assessment, Question } from "@/features/assessments/types/assessment.types";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

const KIND_META: Record<LessonBlockKind, { label: string; icon: typeof BookOpen }> = {
  paragraph: { label: "فقرة", icon: BookOpen },
  pre_assessment: { label: "تقييم قبلي", icon: ClipboardCheck },
  formative_assessment: { label: "تقييم تكويني", icon: ListChecks },
  lesson_video: { label: "فيديو شامل", icon: PlayCircle },
  final_assessment: { label: "تقييم نهائي", icon: ClipboardList },
};

type BlockCardProps = {
  block: LessonFlowBlock;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onRefetch: () => void;
};

export function BlockCard({
  block,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDelete,
  onRefetch,
}: BlockCardProps) {
  const meta = KIND_META[block.kind] ?? KIND_META.paragraph;
  const Icon = meta.icon;

  const [paragraphEditOpen, setParagraphEditOpen] = useState(false);
  const [assessmentEditOpen, setAssessmentEditOpen] = useState(false);
  const [questionsExpanded, setQuestionsExpanded] = useState(false);
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [deletingBlock, setDeletingBlock] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const deleteQuestion = useDeleteQuestion();

  const isAssessment = block.kind !== "paragraph" && block.kind !== "lesson_video";
  const assessment = block.data as Assessment | null;
  const paragraph = block.data as Paragraph | null;

  function closeQuestionForm(open: boolean) {
    setQuestionFormOpen(open);
    if (!open) onRefetch();
  }

  return (
    <Card className={cn(!block.is_published && "opacity-60")}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{meta.label}</span>
                {!block.is_published && (
                  <span
                    data-slot="badge"
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    مخفي عن الطالب
                  </span>
                )}
              </div>
              <BlockBody block={block} collapsed={collapsed} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={collapsed ? "توسيع" : "طي"}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <ChevronRight /> : <ChevronDown />}
            </Button>

            <div className="flex flex-col">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="نقل لأعلى"
                disabled={isFirst}
                onClick={onMoveUp}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="نقل لأسفل"
                disabled={isLast}
                onClick={onMoveDown}
              >
                <ArrowDown />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={block.is_published ? "إخفاء عن الطالب" : "إظهار للطالب"}
              onClick={onToggle}
            >
              {block.is_published ? <EyeOff /> : <Eye />}
            </Button>

            {block.kind === "lesson_video" ? null : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="تعديل"
                onClick={() => {
                  if (isAssessment) setAssessmentEditOpen(true);
                  else setParagraphEditOpen(true);
                }}
              >
                <Pencil />
              </Button>
            )}

            {isAssessment && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuestionsExpanded((prev) => !prev)}
              >
                <ListChecks />
                الأسئلة
              </Button>
            )}

            <RowActions
              ariaLabel={`إجراءات ${meta.label}`}
              items={[
                {
                  key: "delete",
                  label: "حذف من الرحلة",
                  icon: <Trash2 />,
                  destructive: true,
                  onSelect: () => setDeletingBlock(true),
                },
              ]}
            />
          </div>
        </div>

        {isAssessment && questionsExpanded && assessment && !collapsed && (
          <QuestionsPanel
            assessment={assessment}
            onOpenCreate={() => {
              setEditingQuestion(null);
              setQuestionFormOpen(true);
            }}
            onOpenEdit={(question) => {
              setEditingQuestion(question);
              setQuestionFormOpen(true);
            }}
            onDelete={(question) => setDeletingQuestion(question)}
          />
        )}
      </CardContent>

      {block.kind === "paragraph" && (
        <ParagraphFormDialog
          open={paragraphEditOpen}
          onOpenChange={(open) => {
            setParagraphEditOpen(open);
            if (!open) onRefetch();
          }}
          paragraph={paragraph}
          lessonId={block.data ? (paragraph?.lesson_id ?? 0) : 0}
        />
      )}

      {isAssessment && assessment && (
        <AssessmentFormDialog
          open={assessmentEditOpen}
          onOpenChange={(open) => {
            setAssessmentEditOpen(open);
            if (!open) onRefetch();
          }}
          assessment={assessment}
          lessonId={assessment.lesson_id}
          lockType
        />
      )}

      {isAssessment && assessment && (
        <QuestionFormDialog
          open={questionFormOpen}
          onOpenChange={closeQuestionForm}
          assessmentId={assessment.id}
          question={editingQuestion}
        />
      )}

      <DeleteDialog
        open={deletingQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingQuestion(null);
            onRefetch();
          }
        }}
        title="حذف السؤال"
        description={`هل أنت متأكد من حذف السؤال "${deletingQuestion?.content}"؟`}
        isPending={deleteQuestion.isPending}
        onConfirm={() => {
          if (deletingQuestion) {
            deleteQuestion.mutate(deletingQuestion.id, {
              onSuccess: () => {
                setDeletingQuestion(null);
                onRefetch();
              },
            });
          }
        }}
      />

      <DeleteDialog
        open={deletingBlock}
        onOpenChange={setDeletingBlock}
        title={`حذف ${meta.label} من الرحلة`}
        description={`هل أنت متأكد من حذف "${meta.label}" من رحلة الدرس؟ لن يُحذف المحتوى نفسه، ويمكنك إضافته مجددًا.`}
        isPending={false}
        onConfirm={onDelete}
      />
    </Card>
  );
}

function BlockBody({ block, collapsed }: { block: LessonFlowBlock; collapsed: boolean }) {
  if (block.kind === "paragraph") {
    const paragraph = block.data as Paragraph | null;
    if (!paragraph) return <span className="text-sm text-muted-foreground">فقرة فارغة</span>;
    if (collapsed) {
      return <span className="text-sm text-muted-foreground">{paragraph.title}</span>;
    }
    return (
      <div className="flex max-w-xl flex-col gap-1.5">
        <span className="text-sm font-medium">{paragraph.title}</span>
        {paragraph.video_embed ? (
          <VideoEmbed url={paragraph.video_embed} />
        ) : (
          paragraph.content && (
            <div
              className="line-clamp-2 text-xs text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: paragraph.content }}
            />
          )
        )}
        {paragraph.image && (
          <img
            src={paragraph.image}
            alt={paragraph.title}
            className="h-28 w-40 rounded-lg object-cover"
          />
        )}
      </div>
    );
  }

  if (block.kind === "lesson_video") {
    const data = block.data as { video_embed: string | null } | null;
    return data?.video_embed ? (
      <VideoEmbed url={data.video_embed} />
    ) : (
      <span className="text-sm text-muted-foreground">
        الفيديو الشامل — يُضبط من إعدادات الدرس (حقل الفيديو).
      </span>
    );
  }

  const assessment = block.data as Assessment | null;
  if (collapsed) {
    return (
      <span className="text-sm text-muted-foreground">
        {assessment?.title ?? "تقييم بدون عنوان"}
      </span>
    );
  }
  return (
    <span className="text-sm text-muted-foreground">
      {assessment?.title ?? "تقييم بدون عنوان"} · {assessment?.questions?.length ?? 0} سؤال
    </span>
  );
}

function VideoEmbed({ url }: { url: string }) {
  return (
    <div className="aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border">
      <iframe
        src={url}
        title="فيديو الدرس"
        className="h-full w-full"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function QuestionsPanel({
  assessment,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: {
  assessment: Assessment;
  onOpenCreate: () => void;
  onOpenEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}) {
  const questions = assessment.questions ?? [];
  const { data: assessmentDetail, isLoading } = useAssessmentDetail(
    questions.length === 0 ? assessment.id : null
  );

  const list = assessmentDetail?.data.questions ?? questions;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 border-t border-border p-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border p-4">
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد أسئلة بعد — أضف أول سؤال.</p>
      ) : (
        list.map((question, index) => (
          <div key={question.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{question.content}</span>
            </div>
            <RowActions
              ariaLabel={`إجراءات السؤال ${index + 1}`}
              items={[
                {
                  key: "edit",
                  label: "تعديل",
                  icon: <Pencil />,
                  onSelect: () => onOpenEdit(question),
                },
                {
                  key: "delete",
                  label: "حذف",
                  icon: <Trash2 />,
                  destructive: true,
                  onSelect: () => onDelete(question),
                },
              ]}
            />
          </div>
        ))
      )}

      <div className="mt-1">
        <Button type="button" variant="outline" size="sm" onClick={onOpenCreate}>
          <Plus />
          إضافة سؤال
        </Button>
      </div>
    </div>
  );
}
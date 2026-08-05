"use client";

import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  PlayCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LessonFlowBlock, LessonBlockKind } from "../types/lesson-builder.types";
import type { Lesson } from "@/features/lessons/types/lesson.types";
import type { Assessment, Question } from "@/features/assessments/types/assessment.types";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

const KIND_LABEL: Record<LessonBlockKind, string> = {
  paragraph: "فقرة",
  pre_assessment: "تقييم قبلي",
  formative_assessment: "تقييم تكويني",
  lesson_video: "فيديو شامل",
  final_assessment: "تقييم نهائي",
};

type LessonPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson;
  blocks: LessonFlowBlock[];
};

export function LessonPreviewDialog({ open, onOpenChange, lesson, blocks }: LessonPreviewDialogProps) {
  const visible = blocks.filter((block) => block.is_published);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{lesson.title}</DialogTitle>
          <DialogDescription>المعاينة كما يراها الطالب — تظهر العناصر المنشورة فقط.</DialogDescription>
        </DialogHeader>

        <div dir="rtl" className="flex flex-col gap-5 overflow-y-auto p-1">
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground">
              لا توجد عناصر منشورة بعد — انشر عناصر الرحلة ليراها الطالب.
            </p>
          )}
          {visible.map((block) => (
            <PreviewBlock key={block.id} block={block} lesson={lesson} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewBlock({ block, lesson }: { block: LessonFlowBlock; lesson: Lesson }) {
  return (
    <section className="rounded-xl border border-border p-4">
      <header className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <SectionIcon kind={block.kind} />
        {KIND_LABEL[block.kind] ?? "عنصر"}
      </header>
      <PreviewContent block={block} lesson={lesson} />
    </section>
  );
}

function SectionIcon({ kind }: { kind: LessonBlockKind }) {
  const icon = {
    paragraph: BookOpen,
    pre_assessment: ClipboardCheck,
    formative_assessment: ListChecks,
    lesson_video: PlayCircle,
    final_assessment: ClipboardList,
  }[kind];

  const IconTag = icon ?? BookOpen;
  return <IconTag className="size-4 shrink-0" />;
}

function PreviewContent({ block, lesson }: { block: LessonFlowBlock; lesson: Lesson }) {
  if (block.kind === "paragraph") {
    const paragraph = block.data as Paragraph | null;
    if (!paragraph) return null;
    return (
      <article>
        <h3 className="mb-2 text-lg font-bold">{paragraph.title}</h3>
        {paragraph.video_embed ? (
          <PreviewVideo url={paragraph.video_embed} />
        ) : (
          paragraph.content && (
            <div
              className="article-content text-sm leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: paragraph.content }}
            />
          )
        )}
        {paragraph.image && (
          <img
            src={paragraph.image}
            alt={paragraph.title}
            className="mt-3 h-40 w-full rounded-lg object-cover"
          />
        )}
      </article>
    );
  }

  if (block.kind === "lesson_video") {
    const data = block.data as { video_embed: string | null } | null;
    const url = data?.video_embed ?? lesson.video_embed;
    if (!url) return <p className="text-sm text-muted-foreground">لا يوجد فيديو لهذا الدرس.</p>;
    return <PreviewVideo url={url} />;
  }

  const assessment = block.data as Assessment | null;
  if (!assessment) return null;
  return <PreviewAssessment assessment={assessment} />;
}

function PreviewVideo({ url }: { url: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
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

function PreviewAssessment({ assessment }: { assessment: Assessment }) {
  const questions = assessment.questions ?? [];
  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">هذا التقييم بلا أسئلة بعد.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {assessment.title && <h3 className="text-lg font-bold">{assessment.title}</h3>}
      {questions.map((question, index) => (
        <PreviewQuestion key={question.id} index={index} question={question} />
      ))}
    </div>
  );
}

function PreviewQuestion({ index, question }: { index: number; question: Question }) {
  const isTrueFalse = question.type === "true_false";
  const options = question.options ?? [];

  return (
    <div>
      <p className="mb-2 text-sm font-medium">
        {index + 1}. {question.content}
      </p>
      {isTrueFalse ? (
        <div className="flex gap-2">
          {["صح", "خطأ"].map((label) => (
            <span
              key={label}
              className="rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      ) : (
        <ul className={cn("flex flex-col gap-1.5")}>
          {options.map((option) => (
            <li
              key={option.id}
              className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
            >
              {option.content}
            </li>
          ))}
        </ul>
      )}
      {question.explanation && (
        <p className="mt-2 text-xs text-muted-foreground">
          التفسير: {question.explanation}
        </p>
      )}
    </div>
  );
}
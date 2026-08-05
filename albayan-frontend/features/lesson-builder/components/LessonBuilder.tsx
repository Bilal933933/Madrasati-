"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileText,
  ListChecks,
  PlayCircle,
  Plus,
  Rocket,
  Settings,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LessonFormDialog } from "@/features/lessons/components/lesson-form-dialog";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useUpdateLesson } from "@/features/lessons/hooks/useLessons";
import { BlockCard } from "./BlockCard";
import { AddBlockDialog } from "./AddBlockDialog";
import { LessonPreviewDialog } from "./LessonPreviewDialog";
import {
  useAddBlock,
  useDeleteBlock,
  useLessonFlow,
  useReorderBlocks,
  useToggleBlock,
} from "../hooks/useLessonFlow";
import type { LessonBlockKind } from "../types/lesson-builder.types";
import type { Lesson } from "@/features/lessons/types/lesson.types";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

const ADD_OPTIONS: { kind: LessonBlockKind; label: string; icon: typeof FileText }[] = [
  { kind: "paragraph", label: "فقرة", icon: FileText },
  { kind: "pre_assessment", label: "تقييم قبلي", icon: ClipboardCheck },
  { kind: "formative_assessment", label: "تقييم تكويني", icon: ListChecks },
  { kind: "lesson_video", label: "فيديو شامل", icon: PlayCircle },
  { kind: "final_assessment", label: "تقييم نهائي", icon: ClipboardList },
];

const ALL_COURSES = 1000;

export function LessonBuilder({ lessonId }: { lessonId: number }) {
  const { data, isLoading, isError, refetch } = useLessonFlow(lessonId);
  const { data: coursesData } = useCourses({ perPage: ALL_COURSES });

  const addBlock = useAddBlock(lessonId);
  const reorder = useReorderBlocks(lessonId);
  const toggle = useToggleBlock(lessonId);
  const remove = useDeleteBlock(lessonId);
  const updateLesson = useUpdateLesson();

  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [addKind, setAddKind] = useState<LessonBlockKind | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-8 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="px-4 py-8 sm:px-6">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>تعذّر تحميل رحلة الدرس</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>حدث خطأ أثناء جلب محتوى الدرس. حاول مجددًا.</EmptyDescription>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const flow = data.data;
  const lesson = flow.lesson as Lesson;
  const blocks = flow.blocks;
  const paragraphs = blocks
    .filter((block) => block.kind === "paragraph")
    .map((block) => block.data as Paragraph)
    .filter((p): p is Paragraph => p != null);
  const courses = coursesData?.data ?? [];

  function handleQuickAdd(kind: LessonBlockKind) {
    if (kind === "lesson_video") {
      addBlock.mutate({ block_kind: kind });
      return;
    }
    setAddKind(kind);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((block) => block.id));
  }

  function handleTogglePublish() {
    updateLesson.mutate(
      {
        id: lesson.id,
        payload: {
          course_id: lesson.course_id,
          title: lesson.title,
          slug: lesson.slug ?? null,
          summary: lesson.summary ?? null,
          image: lesson.image ?? null,
          video: lesson.video ?? null,
          icon: lesson.icon ?? null,
          color: lesson.color ?? null,
          sort_order: lesson.sort_order ?? 0,
          is_published: !lesson.is_published,
        },
      },
      { onSuccess: () => refetch() }
    );
  }

  const isPublished = lesson.is_published === true;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="محرر رحلة الدرس"
        description={`${lesson.title} — رحلة الطالب عبر عناصر الدرس بالترتيب.`}
        breadcrumb={
          <Link
            href="/admin/lessons"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            الدروس
          </Link>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={blocks.length === 0}>
              <Eye />
              معاينة
            </Button>
            <Button variant="outline" onClick={() => setLessonFormOpen(true)}>
              <Settings />
              إعدادات الدرس
            </Button>
            <Button variant={isPublished ? "outline" : "default"} onClick={handleTogglePublish}>
              {updateLesson.isPending ? (
                <Spinner />
              ) : isPublished ? (
                <Rocket />
              ) : (
                <Rocket />
              )}
              {isPublished ? "إلغاء النشر (مسودة)" : "نشر الدرس"}
            </Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
          <span className="font-semibold">{lesson.title}</span>
          <span
            data-slot="badge"
            className={
              isPublished
                ? "inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            }
          >
            {isPublished ? "منشور" : "مسودة"}
          </span>
          <span className="text-muted-foreground">
            {blocks.length} عنصر في الرحلة · {paragraphs.length} فقرة
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            onToggle={() => toggle.mutate({ id: block.id, isPublished: !block.is_published })}
            onDelete={() => remove.mutate(block.id)}
            onRefetch={() => refetch()}
          />
        ))}
      </div>

      {blocks.length === 0 && (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>الرحلة فارغة</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>ابدأ ببناء رحلة الدرس بإضافة أول عنصر.</EmptyDescription>
          </EmptyContent>
        </Empty>
      )}

      <div className="mt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full">
              <Plus />
              إضافة عنصر
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64">
            <DropdownMenuLabel>اختر نوع العنصر</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ADD_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.kind} onSelect={() => handleQuickAdd(option.kind)}>
                <option.icon />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddBlockDialog
        open={addKind !== null}
        onOpenChange={(open) => {
          if (!open) setAddKind(null);
        }}
        lessonId={lessonId}
        kind={addKind ?? "paragraph"}
        paragraphs={paragraphs}
      />

      <LessonFormDialog
        open={lessonFormOpen}
        onOpenChange={(open) => {
          setLessonFormOpen(open);
          if (!open) refetch();
        }}
        lesson={lesson}
        courses={courses}
      />

      <LessonPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        lesson={lesson}
        blocks={blocks}
      />
    </div>
  );
}
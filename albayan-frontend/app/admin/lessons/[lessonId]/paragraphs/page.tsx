"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ParagraphsTable } from "@/features/paragraphs/components/paragraphs-table";
import { ParagraphFormDialog } from "@/features/paragraphs/components/paragraph-form-dialog";
import {
  useParagraphs,
  useDeleteParagraph,
} from "@/features/paragraphs/hooks/useParagraphs";
import { useLessons } from "@/features/lessons/hooks/useLessons";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

export default function AdminLessonParagraphsPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = Number(params.lessonId);

  const { data: paragraphsData, isLoading } = useParagraphs({ lessonId });
  const { data: lessonsData } = useLessons();
  const deleteParagraph = useDeleteParagraph();
  const paragraphs = paragraphsData?.data ?? [];
  const lesson = lessonsData?.data.find((l) => l.id === lessonId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingParagraph, setEditingParagraph] = useState<Paragraph | null>(null);
  const [deletingParagraph, setDeletingParagraph] = useState<Paragraph | null>(null);

  function openCreate() {
    setEditingParagraph(null);
    setFormOpen(true);
  }

  function openEdit(paragraph: Paragraph) {
    setEditingParagraph(paragraph);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <PageHeader
        title="فقرات الدرس"
        description={
          lesson
            ? `فقرات الدرس: ${lesson.title} — نصوص وصور وفيديوهات تُبنى بها محتوى الدرس.`
            : `رقم الدرس: ${lessonId} — نصوص وصور وفيديوهات تُبنى بها محتوى الدرس.`
        }
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
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            إضافة فقرة
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <ParagraphsTable
            paragraphs={paragraphs}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeletingParagraph}
          />
        </CardContent>
      </Card>

      <ParagraphFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        paragraph={editingParagraph}
        lessonId={lessonId}
      />

      <DeleteDialog
        open={deletingParagraph !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingParagraph(null);
        }}
        title="حذف الفقرة"
        description={`هل أنت متأكد من حذف الفقرة "${deletingParagraph?.title}"؟ سيتم حذف التقييمات المرتبطة بها.`}
        isPending={deleteParagraph.isPending}
        onConfirm={() => {
          if (deletingParagraph) {
            deleteParagraph.mutate(deletingParagraph.id, {
              onSuccess: () => setDeletingParagraph(null),
            });
          }
        }}
      />
    </div>
  );
}

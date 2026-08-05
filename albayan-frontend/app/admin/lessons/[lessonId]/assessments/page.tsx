"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssessmentsList } from "@/features/assessments/components/assessments-list";
import { AssessmentFormDialog } from "@/features/assessments/components/assessment-form-dialog";
import {
  useAssessments,
  useDeleteAssessment,
} from "@/features/assessments/hooks/useAssessments";
import { useLesson } from "@/features/lessons/hooks/useLessons";
import { useParagraphs } from "@/features/paragraphs/hooks/useParagraphs";
import type { Assessment } from "@/features/assessments/types/assessment.types";

export default function AdminLessonAssessmentsPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = Number(params.lessonId);

  const { data: assessmentsData, isLoading } = useAssessments({ lessonId });
  const { data: paragraphsData } = useParagraphs({ lessonId });
  const { data: lessonData } = useLesson(lessonId);
  const deleteAssessment = useDeleteAssessment();
  const assessments = assessmentsData?.data ?? [];
  const paragraphs = paragraphsData?.data ?? [];
  const lesson = lessonData?.data;

  const [formOpen, setFormOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [deletingAssessment, setDeletingAssessment] = useState<Assessment | null>(null);

  function openCreate() {
    setEditingAssessment(null);
    setFormOpen(true);
  }

  function openEdit(assessment: Assessment) {
    setEditingAssessment(assessment);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <PageHeader
        title="تقييمات الدرس"
        description={
          lesson
            ? `تقييمات الدرس: ${lesson.title} — مبدئية وتكوينية وختامية.`
            : `رقم الدرس: ${lessonId} — مبدئية وتكوينية وختامية.`
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
            إضافة تقييم
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <AssessmentsList
            assessments={assessments}
            paragraphs={paragraphs}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeletingAssessment}
          />
        </CardContent>
      </Card>

      <AssessmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        assessment={editingAssessment}
        lessonId={lessonId}
      />

      <DeleteDialog
        open={deletingAssessment !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingAssessment(null);
        }}
        title="حذف التقييم"
        description={`هل أنت متأكد من حذف التقييم "${deletingAssessment?.title ?? "بدون عنوان"}"؟ سيتم حذف كل أسئلته.`}
        isPending={deleteAssessment.isPending}
        onConfirm={() => {
          if (deletingAssessment) {
            deleteAssessment.mutate(deletingAssessment.id, {
              onSuccess: () => setDeletingAssessment(null),
            });
          }
        }}
      />
    </div>
  );
}

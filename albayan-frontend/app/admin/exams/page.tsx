"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { CascadeFilter } from "@/components/shared/cascade-filter";
import { useCascadeFilter } from "@/components/shared/use-cascade-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExamBlueprintsTable } from "@/features/exams/components/exam-blueprints-table";
import { ExamBlueprintFormDialog } from "@/features/exams/components/blueprint-form-dialog";
import {
  useExamBlueprints,
  useDeleteExamBlueprint,
} from "@/features/exams/hooks/useExamBlueprints";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useSemesters } from "@/features/semesters/hooks/useSemesters";
import { useLessons } from "@/features/lessons/hooks/useLessons";
import { EXAM_TYPE_LABELS, type ExamBlueprint, type ExamType } from "@/features/exams/types/exam.types";

const ALL_RECORDS = 1000;

export default function AdminExamsPage() {
  const { data: coursesData, isLoading: coursesLoading } = useCourses({ perPage: ALL_RECORDS });
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects({ perPage: ALL_RECORDS });
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const { data: semestersData } = useSemesters();
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({ perPage: ALL_RECORDS });

  const filter = useCascadeFilter({
    stages: stagesData?.data ?? [],
    grades: gradesData?.data ?? [],
    semesters: semestersData?.data ?? [],
    subjects: subjectsData?.data ?? [],
    courses: coursesData?.data ?? [],
  });

  const [examType, setExamType] = useState<string>("all");

  const { data: blueprintsData, isLoading } = useExamBlueprints({
    examType: examType !== "all" ? (examType as ExamType) : undefined,
  });

  const deleteBlueprint = useDeleteExamBlueprint();
  const blueprints = blueprintsData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<ExamBlueprint | null>(null);
  const [deletingBlueprint, setDeletingBlueprint] = useState<ExamBlueprint | null>(null);

  function openCreate() {
    setEditingBlueprint(null);
    setFormOpen(true);
  }

  function openEdit(blueprint: ExamBlueprint) {
    setEditingBlueprint(blueprint);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="الامتحانات"
        description="إدارة تعريفات الامتحانات ونطاقاتها."
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            إضافة تعريف امتحان
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <CascadeFilter
          filter={filter}
          levels={["stage", "grade", "semester", "subject", "course"]}
        />
        <Select value={examType} onValueChange={setExamType}>
          <SelectTrigger aria-label="تصفية حسب نوع الامتحان" className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {EXAM_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 pt-4">
          <ExamBlueprintsTable
            blueprints={blueprints}
            isLoading={
              isLoading ||
              lessonsLoading ||
              coursesLoading ||
              subjectsLoading ||
              gradesLoading ||
              stagesLoading
            }
            onEdit={openEdit}
            onDelete={setDeletingBlueprint}
          />
        </CardContent>
      </Card>

      <ExamBlueprintFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        blueprint={editingBlueprint}
        filter={filter}
        lessons={lessonsData?.data ?? []}
      />

      <DeleteDialog
        open={deletingBlueprint !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingBlueprint(null);
        }}
        title="حذف تعريف الامتحان"
        description={`هل أنت متأكد من حذف "${deletingBlueprint?.title}"؟ سيتم حذف كل محاولات الامتحان المرتبطة به.`}
        isPending={deleteBlueprint.isPending}
        onConfirm={() => {
          if (deletingBlueprint) {
            deleteBlueprint.mutate(deletingBlueprint.id, {
              onSuccess: () => setDeletingBlueprint(null),
            });
          }
        }}
      />
    </div>
  );
}
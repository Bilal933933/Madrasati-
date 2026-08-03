"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SubjectsTable } from "@/features/subjects/components/subjects-table";
import { SubjectFormDialog } from "@/features/subjects/components/subject-form-dialog";
import { useSubjects, useDeleteSubject } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Subject } from "@/features/subjects/types/subject.types";

export default function AdminSubjectsPage() {
  const { data: subjectsData, isLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteSubject = useDeleteSubject();
  const subjects = subjectsData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const filteredSubjects =
    gradeFilter === "all"
      ? subjects
      : subjects.filter((s) => s.grade_id === Number(gradeFilter));

  function openCreate() {
    setEditingSubject(null);
    setFormOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المواد الدراسية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة المواد وتنظيمها ضمن الصفوف.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NativeSelect
            aria-label="تصفية حسب الصف"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-52"
          >
            <NativeSelectOption value="all">
              كل الصفوف
            </NativeSelectOption>
            {grades.map((grade) => (
              <NativeSelectOption key={grade.id} value={String(grade.id)}>
                {grade.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button onClick={openCreate}>
            <Plus />
            إضافة مادة
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 pt-4">
          <SubjectsTable
            subjects={filteredSubjects}
            grades={grades}
            stages={stages}
            isLoading={isLoading || gradesLoading || stagesLoading}
            onEdit={openEdit}
            onDelete={setDeletingSubject}
          />
        </CardContent>
      </Card>

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subject={editingSubject}
        grades={grades}
        defaultGradeId={gradeFilter === "all" ? undefined : Number(gradeFilter)}
      />

      <DeleteDialog
        open={deletingSubject !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSubject(null);
        }}
        title="حذف المادة"
        description={`هل أنت متأكد من حذف المادة "${deletingSubject?.name}"؟ سيتم حذف كل الأقسام والدورات المرتبطة بها.`}
        isPending={deleteSubject.isPending}
        onConfirm={() => {
          if (deletingSubject) {
            deleteSubject.mutate(deletingSubject.id, {
              onSuccess: () => setDeletingSubject(null),
            });
          }
        }}
      />
    </div>
  );
}
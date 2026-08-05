"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { CascadeFilter } from "@/components/shared/cascade-filter";
import { useCascadeFilter, filterSubjects, activeId } from "@/components/shared/use-cascade-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectsTable } from "@/features/subjects/components/subjects-table";
import { SubjectFormDialog } from "@/features/subjects/components/subject-form-dialog";
import { useSubjects, useDeleteSubject } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useSemesters } from "@/features/semesters/hooks/useSemesters";
import type { Subject } from "@/features/subjects/types/subject.types";

export default function AdminSubjectsPage() {
  const { data: subjectsData, isLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const { data: semestersData } = useSemesters();
  const filter = useCascadeFilter({
    stages: stagesData?.data ?? [],
    grades: gradesData?.data ?? [],
    semesters: semestersData?.data ?? [],
  });
  const deleteSubject = useDeleteSubject();
  const subjects = subjectsData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];
  const semesters = semestersData?.data ?? [];

  const filteredSubjects = filterSubjects(subjects, filter.values);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  function openCreate() {
    setEditingSubject(null);
    setFormOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="المواد الدراسية"
        description="إدارة المواد وتنظيمها ضمن الصفوف."
        actions={
          <>
            <CascadeFilter filter={filter} levels={["stage", "grade", "semester"]} />
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus />
              إضافة مادة
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <SubjectsTable
            subjects={filteredSubjects}
            grades={grades}
            stages={stages}
            semesters={semesters}
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
        semesters={semesters}
        defaultGradeId={activeId(filter.values.grade)}
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

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { CascadeFilter } from "@/components/shared/cascade-filter";
import { useCascadeFilter, filterSemesters, activeId } from "@/components/shared/use-cascade-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SemestersTable } from "@/features/semesters/components/semesters-table";
import { SemesterFormDialog } from "@/features/semesters/components/semester-form-dialog";
import { useSemesters, useDeleteSemester } from "@/features/semesters/hooks/useSemesters";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Semester } from "@/features/semesters/types/semester.types";

export default function AdminSemestersPage() {
  const { data: semestersData, isLoading } = useSemesters();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const filter = useCascadeFilter({
    stages: stagesData?.data ?? [],
    grades: gradesData?.data ?? [],
  });
  const deleteSemester = useDeleteSemester();
  const semesters = semestersData?.data ?? [];
  const grades = gradesData?.data ?? [];

  const filteredSemesters = filterSemesters(semesters, filter.values);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);

  function openCreate() {
    setEditingSemester(null);
    setFormOpen(true);
  }

  function openEdit(semester: Semester) {
    setEditingSemester(semester);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <PageHeader
        title="الفصول الدراسية"
        description="إدارة الفصول وتنظيمها ضمن الصفوف."
        actions={
          <>
            <CascadeFilter filter={filter} levels={["stage", "grade"]} />
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus />
              إضافة فصل
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <SemestersTable
            semesters={filteredSemesters}
            grades={grades}
            isLoading={isLoading || gradesLoading || stagesLoading}
            onEdit={openEdit}
            onDelete={setDeletingSemester}
          />
        </CardContent>
      </Card>

      <SemesterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        semester={editingSemester}
        grades={grades}
        defaultGradeId={activeId(filter.values.grade)}
      />

      <DeleteDialog
        open={deletingSemester !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSemester(null);
        }}
        title="حذف الفصل"
        description={`هل أنت متأكد من حذف الفصل "${deletingSemester?.name}"؟ سيتم حذف كل المواد المرتبطة به.`}
        isPending={deleteSemester.isPending}
        onConfirm={() => {
          if (deletingSemester) {
            deleteSemester.mutate(deletingSemester.id, {
              onSuccess: () => setDeletingSemester(null),
            });
          }
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { CascadeFilter } from "@/components/shared/cascade-filter";
import { useCascadeFilter, filterGrades, activeId } from "@/components/shared/use-cascade-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradesTable } from "@/features/grades/components/grades-table";
import { GradeFormDialog } from "@/features/grades/components/grade-form-dialog";
import { useGrades, useDeleteGrade } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Grade } from "@/features/grades/types/grade.types";

export default function AdminGradesPage() {
  const { data: gradesData, isLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const filter = useCascadeFilter({ stages: stagesData?.data ?? [] });
  const deleteGrade = useDeleteGrade();
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const filteredGrades = filterGrades(grades, filter.values);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<Grade | null>(null);

  function openCreate() {
    setEditingGrade(null);
    setFormOpen(true);
  }

  function openEdit(grade: Grade) {
    setEditingGrade(grade);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <PageHeader
        title="الصفوف الدراسية"
        description="إدارة الصفوف وتنظيمها ضمن المراحل."
        actions={
          <>
            <CascadeFilter filter={filter} levels={["stage"]} />
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus />
              إضافة صف
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <GradesTable
            grades={filteredGrades}
            stages={stages}
            isLoading={isLoading || stagesLoading}
            onEdit={openEdit}
            onDelete={setDeletingGrade}
          />
        </CardContent>
      </Card>

      <GradeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        grade={editingGrade}
        stages={stages}
        defaultStageId={activeId(filter.values.stage)}
      />

      <DeleteDialog
        open={deletingGrade !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingGrade(null);
        }}
        title="حذف الصف"
        description={`هل أنت متأكد من حذف الصف "${deletingGrade?.name}"؟ سيتم حذف كل المواد والدورات المرتبطة به.`}
        isPending={deleteGrade.isPending}
        onConfirm={() => {
          if (deletingGrade) {
            deleteGrade.mutate(deletingGrade.id, {
              onSuccess: () => setDeletingGrade(null),
            });
          }
        }}
      />
    </div>
  );
}

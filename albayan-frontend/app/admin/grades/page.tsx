"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { GradesTable } from "@/features/grades/components/grades-table";
import { GradeFormDialog } from "@/features/grades/components/grade-form-dialog";
import { useGrades, useDeleteGrade } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Grade } from "@/features/grades/types/grade.types";

export default function AdminGradesPage() {
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [appliedStageFilter, setAppliedStageFilter] = useState<string>("all");
  const { data: gradesData, isLoading } = useGrades(
    appliedStageFilter === "all"
      ? undefined
      : { stageId: Number(appliedStageFilter) }
  );
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteGrade = useDeleteGrade();
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

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
            <NativeSelect
              aria-label="تصفية حسب المرحلة"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full sm:w-52"
            >
              <NativeSelectOption value="all">
                كل المراحل
              </NativeSelectOption>
              {stages.map((stage) => (
                <NativeSelectOption key={stage.id} value={String(stage.id)}>
                  {stage.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button
              variant="outline"
              onClick={() => setAppliedStageFilter(stageFilter)}
              className="w-full sm:w-auto"
            >
              تطبيق
            </Button>
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
            grades={grades}
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
        defaultStageId={appliedStageFilter === "all" ? undefined : Number(appliedStageFilter)}
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
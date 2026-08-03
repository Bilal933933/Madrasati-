"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Header } from "@/components/shared/header";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { GradesTable } from "@/features/grades/components/grades-table";
import { GradeFormDialog } from "@/features/grades/components/grade-form-dialog";
import { useGrades, useDeleteGrade } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { Grade } from "@/features/grades/types/grade.types";

export default function AdminGradesPage() {
  const user = useAuthStore((state) => state.user);
  const { data: gradesData, isLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteGrade = useDeleteGrade();
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const [stageFilter, setStageFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<Grade | null>(null);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-1 flex-col bg-background">
        <Header />
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16">
          <Card className="max-w-md">
            <CardHeader className="items-center text-center">
              <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <ShieldAlert className="size-6" />
              </span>
              <CardTitle className="text-xl">غير مصرّح</CardTitle>
              <CardDescription>
                عذرًا، هذه الصفحة مخصصة للمشرفين فقط.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const filteredGrades =
    stageFilter === "all" ? grades : grades.filter((g) => g.stage_id === Number(stageFilter));

  function openCreate() {
    setEditingGrade(null);
    setFormOpen(true);
  }

  function openEdit(grade: Grade) {
    setEditingGrade(grade);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">الصفوف الدراسية</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة الصفوف وتنظيمها ضمن المراحل.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NativeSelect
              aria-label="تصفية حسب المرحلة"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-52"
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
            <Button onClick={openCreate}>
              <Plus />
              إضافة صف
            </Button>
          </div>
        </div>

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
      </main>

      <GradeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        grade={editingGrade}
        stages={stages}
        defaultStageId={stageFilter === "all" ? undefined : Number(stageFilter)}
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

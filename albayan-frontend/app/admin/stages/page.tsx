"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StagesTable } from "@/features/stages/components/stages-table";
import { StageFormDialog } from "@/features/stages/components/stage-form-dialog";
import { useStages, useDeleteStage } from "@/features/stages/hooks/useStages";
import type { Stage } from "@/features/stages/types/stage.types";

export default function AdminStagesPage() {
  const { data, isLoading } = useStages();
  const deleteStage = useDeleteStage();
  const stages = data?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [deletingStage, setDeletingStage] = useState<Stage | null>(null);

  function openCreate() {
    setEditingStage(null);
    setFormOpen(true);
  }

  function openEdit(stage: Stage) {
    setEditingStage(stage);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <PageHeader
        title="المراحل الدراسية"
        description="إدارة مراحل التعليم في المنصة."
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            إضافة مرحلة
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <StagesTable
            stages={stages}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeletingStage}
          />
        </CardContent>
      </Card>

      <StageFormDialog open={formOpen} onOpenChange={setFormOpen} stage={editingStage} />

      <DeleteDialog
        open={deletingStage !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingStage(null);
        }}
        title="حذف المرحلة"
        description={`هل أنت متأكد من حذف المرحلة "${deletingStage?.name}"؟ سيتم حذف كل الصفوف والمواد المرتبطة بها.`}
        isPending={deleteStage.isPending}
        onConfirm={() => {
          if (deletingStage) {
            deleteStage.mutate(deletingStage.id, {
              onSuccess: () => setDeletingStage(null),
            });
          }
        }}
      />
    </div>
  );
}
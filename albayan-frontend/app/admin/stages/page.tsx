"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Header } from "@/components/shared/header";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StagesTable } from "@/features/stages/components/stages-table";
import { StageFormDialog } from "@/features/stages/components/stage-form-dialog";
import { useStages, useDeleteStage } from "@/features/stages/hooks/useStages";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { Stage } from "@/features/stages/types/stage.types";

export default function AdminStagesPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useStages();
  const deleteStage = useDeleteStage();
  const stages = data?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [deletingStage, setDeletingStage] = useState<Stage | null>(null);

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

  function openCreate() {
    setEditingStage(null);
    setFormOpen(true);
  }

  function openEdit(stage: Stage) {
    setEditingStage(stage);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">المراحل الدراسية</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة مراحل التعليم في المنصة.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus />
            إضافة مرحلة
          </Button>
        </div>

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
      </main>

      <StageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        stage={editingStage}
      />

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

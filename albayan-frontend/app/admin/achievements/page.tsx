"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AchievementsTable } from "@/features/achievements/components/admin/achievements-table";
import { AchievementFormDialog } from "@/features/achievements/components/admin/achievement-form-dialog";
import { useAchievements, useDeleteAchievement } from "@/features/achievements/hooks/useAchievements";
import type { AchievementDefinition } from "@/features/achievements/types/achievement.types";

export default function AdminAchievementsPage() {
  const { data, isLoading } = useAchievements();
  const deleteAchievement = useDeleteAchievement();
  const items = data?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementDefinition | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<AchievementDefinition | null>(null);

  function openCreate() {
    setEditingAchievement(null);
    setFormOpen(true);
  }

  function openEdit(achievement: AchievementDefinition) {
    setEditingAchievement(achievement);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="الإنجازات"
        description="إدارة أوسمة الإنجاز وعتبات فتحها لدى الطلاب."
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            إضافة إنجاز
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <AchievementsTable
            items={items}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeletingAchievement}
          />
        </CardContent>
      </Card>

      <AchievementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        achievement={editingAchievement}
      />

      <DeleteDialog
        open={deletingAchievement !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingAchievement(null);
        }}
        title="حذف الإنجاز"
        description={`هل أنت متأكد من حذف الإنجاز "${deletingAchievement?.title}"؟ لن يُحذف ما سبق للطلاب فتحه.`}
        isPending={deleteAchievement.isPending}
        onConfirm={() => {
          if (deletingAchievement) {
            deleteAchievement.mutate(deletingAchievement.id, {
              onSuccess: () => setDeletingAchievement(null),
            });
          }
        }}
      />
    </div>
  );
}
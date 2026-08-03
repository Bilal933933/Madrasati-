"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Header } from "@/components/shared/header";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SectionsTable } from "@/features/sections/components/sections-table";
import { SectionFormDialog } from "@/features/sections/components/section-form-dialog";
import { useSections, useDeleteSection } from "@/features/sections/hooks/useSections";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { Section } from "@/features/sections/types/section.types";

export default function AdminSectionsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: sectionsData, isLoading } = useSections();
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteSection = useDeleteSection();
  const sections = sectionsData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);

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

  const filteredSections =
    subjectFilter === "all"
      ? sections
      : sections.filter((s) => s.subject_id === Number(subjectFilter));

  function openCreate() {
    setEditingSection(null);
    setFormOpen(true);
  }

  function openEdit(section: Section) {
    setEditingSection(section);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">الوحدات الدراسية</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة الوحدات وتنظيمها ضمن المواد.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NativeSelect
              aria-label="تصفية حسب المادة"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-52"
            >
              <NativeSelectOption value="all">
                كل المواد
              </NativeSelectOption>
              {subjects.map((subject) => (
                <NativeSelectOption key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button onClick={openCreate}>
              <Plus />
              إضافة وحدة
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0 pt-4">
            <SectionsTable
              sections={filteredSections}
              subjects={subjects}
              grades={grades}
              stages={stages}
              isLoading={isLoading || subjectsLoading || gradesLoading || stagesLoading}
              onEdit={openEdit}
              onDelete={setDeletingSection}
            />
          </CardContent>
        </Card>
      </main>

      <SectionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        section={editingSection}
        subjects={subjects}
        defaultSubjectId={subjectFilter === "all" ? undefined : Number(subjectFilter)}
      />

      <DeleteDialog
        open={deletingSection !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSection(null);
        }}
        title="حذف الوحدة"
        description={`هل أنت متأكد من حذف الوحدة "${deletingSection?.name}"؟ سيتم حذف كل الدورات والدروس المرتبطة بها.`}
        isPending={deleteSection.isPending}
        onConfirm={() => {
          if (deletingSection) {
            deleteSection.mutate(deletingSection.id, {
              onSuccess: () => setDeletingSection(null),
            });
          }
        }}
      />
    </div>
  );
}

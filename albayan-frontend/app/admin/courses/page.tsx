"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CoursesTable } from "@/features/courses/components/courses-table";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import { useCourses, useDeleteCourse } from "@/features/courses/hooks/useCourses";
import { useSections } from "@/features/sections/hooks/useSections";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Course } from "@/features/courses/types/course.types";

export default function AdminCoursesPage() {
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [appliedSectionFilter, setAppliedSectionFilter] = useState<string>("all");
  const { data: coursesData, isLoading } = useCourses(
    appliedSectionFilter === "all"
      ? undefined
      : { sectionId: Number(appliedSectionFilter) }
  );
  const { data: sectionsData, isLoading: sectionsLoading } = useSections();
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteCourse = useDeleteCourse();
  const courses = coursesData?.data ?? [];
  const sections = sectionsData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  function openCreate() {
    setEditingCourse(null);
    setFormOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المقررات الدراسية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة المقررات وتنظيمها ضمن الوحدات.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NativeSelect
            aria-label="تصفية حسب الوحدة"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-52"
          >
            <NativeSelectOption value="all">
              كل الوحدات
            </NativeSelectOption>
            {sections.map((section) => (
              <NativeSelectOption key={section.id} value={String(section.id)}>
                {section.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button variant="outline" onClick={() => setAppliedSectionFilter(sectionFilter)}>
            تطبيق
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            إضافة مقرر
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 pt-4">
          <CoursesTable
            courses={courses}
            sections={sections}
            subjects={subjects}
            grades={grades}
            stages={stages}
            isLoading={isLoading || sectionsLoading || subjectsLoading || gradesLoading || stagesLoading}
            onEdit={openEdit}
            onDelete={setDeletingCourse}
          />
        </CardContent>
      </Card>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        sections={sections}
        defaultSectionId={appliedSectionFilter === "all" ? undefined : Number(appliedSectionFilter)}
      />

      <DeleteDialog
        open={deletingCourse !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCourse(null);
        }}
        title="حذف المقرر"
        description={`هل أنت متأكد من حذف المقرر "${deletingCourse?.name}"؟ سيتم حذف كل الدروس المرتبطة به.`}
        isPending={deleteCourse.isPending}
        onConfirm={() => {
          if (deletingCourse) {
            deleteCourse.mutate(deletingCourse.id, {
              onSuccess: () => setDeletingCourse(null),
            });
          }
        }}
      />
    </div>
  );
}
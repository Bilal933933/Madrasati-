"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Header } from "@/components/shared/header";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CoursesTable } from "@/features/courses/components/courses-table";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import { useCourses, useDeleteCourse } from "@/features/courses/hooks/useCourses";
import { useSections } from "@/features/sections/hooks/useSections";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { Course } from "@/features/courses/types/course.types";

export default function AdminCoursesPage() {
  const user = useAuthStore((state) => state.user);
  const { data: coursesData, isLoading } = useCourses();
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

  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

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

  const filteredCourses =
    sectionFilter === "all"
      ? courses
      : courses.filter((c) => c.section_id === Number(sectionFilter));

  function openCreate() {
    setEditingCourse(null);
    setFormOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
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
            <Button onClick={openCreate}>
              <Plus />
              إضافة مقرر
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0 pt-4">
            <CoursesTable
              courses={filteredCourses}
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
      </main>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        sections={sections}
        defaultSectionId={sectionFilter === "all" ? undefined : Number(sectionFilter)}
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

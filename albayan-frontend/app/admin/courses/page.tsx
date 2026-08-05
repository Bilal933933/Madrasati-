"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CoursesTable } from "@/features/courses/components/courses-table";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import { useCourses, useDeleteCourse } from "@/features/courses/hooks/useCourses";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Course } from "@/features/courses/types/course.types";

export default function AdminCoursesPage() {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [appliedSubjectFilter, setAppliedSubjectFilter] = useState<string>("all");
  const { data: coursesData, isLoading } = useCourses(
    appliedSubjectFilter === "all"
      ? undefined
      : { subjectId: Number(appliedSubjectFilter) }
  );
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteCourse = useDeleteCourse();
  const courses = coursesData?.data ?? [];
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
      <PageHeader
        title="المقررات الدراسية"
        description="إدارة المقررات وتنظيمها ضمن المواد."
        actions={
          <>
            <NativeSelect
              aria-label="تصفية حسب المادة"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full sm:w-52"
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
            <Button
              variant="outline"
              onClick={() => setAppliedSubjectFilter(subjectFilter)}
              className="w-full sm:w-auto"
            >
              تطبيق
            </Button>
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus />
              إضافة مقرر
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <CoursesTable
            courses={courses}
            subjects={subjects}
            grades={grades}
            stages={stages}
            isLoading={isLoading || subjectsLoading || gradesLoading || stagesLoading}
            onEdit={openEdit}
            onDelete={setDeletingCourse}
          />
        </CardContent>
      </Card>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        subjects={subjects}
        defaultSubjectId={appliedSubjectFilter === "all" ? undefined : Number(appliedSubjectFilter)}
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
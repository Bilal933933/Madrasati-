"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { CascadeFilter } from "@/components/shared/cascade-filter";
import { useCascadeFilter, activeId } from "@/components/shared/use-cascade-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoursesTable } from "@/features/courses/components/courses-table";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import { useCourses, useDeleteCourse } from "@/features/courses/hooks/useCourses";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useSemesters } from "@/features/semesters/hooks/useSemesters";
import type { Course } from "@/features/courses/types/course.types";

const PAGE_SIZE = 20;

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const { data: semestersData } = useSemesters();
  const filter = useCascadeFilter({
    stages: stagesData?.data ?? [],
    grades: gradesData?.data ?? [],
    semesters: semestersData?.data ?? [],
    subjects: subjectsData?.data ?? [],
  });

  const filterWithPageReset = {
    ...filter,
    setValue: (level: Parameters<typeof filter.setValue>[0], value: string) => {
      filter.setValue(level, value);
      setPage(1);
    },
  };

  const { data: coursesData, isLoading } = useCourses({
    stageId: activeId(filter.values.stage),
    gradeId: activeId(filter.values.grade),
    semesterId: activeId(filter.values.semester),
    subjectId: activeId(filter.values.subject),
    page,
    perPage: PAGE_SIZE,
  });

  const deleteCourse = useDeleteCourse();
  const courses = coursesData?.data ?? [];
  const meta = coursesData?.meta;
  const totalPages = meta?.last_page ?? 1;
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
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="المقررات الدراسية"
        description="إدارة المقررات وتنظيمها ضمن المواد."
        actions={
          <>
            <CascadeFilter
              filter={filterWithPageReset}
              levels={["stage", "grade", "semester", "subject"]}
            />
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
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        subjects={subjects}
        defaultSubjectId={activeId(filter.values.subject)}
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
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
import { LessonsTable } from "@/features/lessons/components/lessons-table";
import { LessonFormDialog } from "@/features/lessons/components/lesson-form-dialog";
import { useLessons, useDeleteLesson } from "@/features/lessons/hooks/useLessons";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useSemesters } from "@/features/semesters/hooks/useSemesters";
import type { Lesson } from "@/features/lessons/types/lesson.types";

const PAGE_SIZE = 20;
const ALL_RECORDS = 1000;

export default function AdminLessonsPage() {
  const [page, setPage] = useState(1);
  const { data: coursesData, isLoading: coursesLoading } = useCourses({ perPage: ALL_RECORDS });
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const { data: semestersData } = useSemesters();
  const filter = useCascadeFilter({
    stages: stagesData?.data ?? [],
    grades: gradesData?.data ?? [],
    semesters: semestersData?.data ?? [],
    subjects: subjectsData?.data ?? [],
    courses: coursesData?.data ?? [],
  });

  const filterWithPageReset = {
    ...filter,
    setValue: (level: Parameters<typeof filter.setValue>[0], value: string) => {
      filter.setValue(level, value);
      setPage(1);
    },
  };

  const { data: lessonsData, isLoading } = useLessons({
    stageId: activeId(filter.values.stage),
    gradeId: activeId(filter.values.grade),
    semesterId: activeId(filter.values.semester),
    subjectId: activeId(filter.values.subject),
    courseId: activeId(filter.values.course),
    page,
    perPage: PAGE_SIZE,
  });

  const deleteLesson = useDeleteLesson();
  const lessons = lessonsData?.data ?? [];
  const meta = lessonsData?.meta;
  const totalPages = meta?.last_page ?? 1;
  const courses = coursesData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  function openCreate() {
    setEditingLesson(null);
    setFormOpen(true);
  }

  function openEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="الدروس"
        description="إدارة الدروس وتنظيمها ضمن المقررات."
        actions={
          <>
            <CascadeFilter
              filter={filterWithPageReset}
              levels={["stage", "grade", "semester", "subject", "course"]}
            />
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus />
              إضافة درس
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0 pt-4">
          <LessonsTable
            lessons={lessons}
            courses={courses}
            subjects={subjects}
            grades={grades}
            stages={stages}
            isLoading={
              isLoading ||
              coursesLoading ||
              subjectsLoading ||
              gradesLoading ||
              stagesLoading
            }
            onEdit={openEdit}
            onDelete={setDeletingLesson}
          />
        </CardContent>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editingLesson}
        courses={courses}
        defaultCourseId={activeId(filter.values.course)}
      />

      <DeleteDialog
        open={deletingLesson !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingLesson(null);
        }}
        title="حذف الدرس"
        description={`هل أنت متأكد من حذف الدرس "${deletingLesson?.title}"؟ سيتم حذف كل الفقرات المرتبطة به.`}
        isPending={deleteLesson.isPending}
        onConfirm={() => {
          if (deletingLesson) {
            deleteLesson.mutate(deletingLesson.id, {
              onSuccess: () => setDeletingLesson(null),
            });
          }
        }}
      />
    </div>
  );
}
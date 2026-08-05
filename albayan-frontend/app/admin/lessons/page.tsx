"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { LessonsTable } from "@/features/lessons/components/lessons-table";
import { LessonFormDialog } from "@/features/lessons/components/lesson-form-dialog";
import { useLessons, useDeleteLesson } from "@/features/lessons/hooks/useLessons";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import type { Lesson } from "@/features/lessons/types/lesson.types";

export default function AdminLessonsPage() {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [appliedCourseFilter, setAppliedCourseFilter] = useState<string>("all");
  const { data: lessonsData, isLoading } = useLessons(
    appliedCourseFilter === "all"
      ? undefined
      : { courseId: Number(appliedCourseFilter) }
  );
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteLesson = useDeleteLesson();
  const lessons = lessonsData?.data ?? [];
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
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <PageHeader
        title="الدروس"
        description="إدارة الدروس وتنظيمها ضمن المقررات."
        actions={
          <>
            <NativeSelect
              aria-label="تصفية حسب المقرر"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full sm:w-52"
            >
              <NativeSelectOption value="all">
                كل المقررات
              </NativeSelectOption>
              {courses.map((course) => (
                <NativeSelectOption key={course.id} value={String(course.id)}>
                  {course.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button
              variant="outline"
              onClick={() => setAppliedCourseFilter(courseFilter)}
              className="w-full sm:w-auto"
            >
              تطبيق
            </Button>
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
            isLoading={isLoading || coursesLoading || subjectsLoading || gradesLoading || stagesLoading}
            onEdit={openEdit}
            onDelete={setDeletingLesson}
          />
        </CardContent>
      </Card>

      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editingLesson}
        courses={courses}
        defaultCourseId={appliedCourseFilter === "all" ? undefined : Number(appliedCourseFilter)}
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
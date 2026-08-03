"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Header } from "@/components/shared/header";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { LessonsTable } from "@/features/lessons/components/lessons-table";
import { LessonFormDialog } from "@/features/lessons/components/lesson-form-dialog";
import { useLessons, useDeleteLesson } from "@/features/lessons/hooks/useLessons";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useSections } from "@/features/sections/hooks/useSections";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { Lesson } from "@/features/lessons/types/lesson.types";

export default function AdminLessonsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: lessonsData, isLoading } = useLessons();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: sectionsData, isLoading: sectionsLoading } = useSections();
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const deleteLesson = useDeleteLesson();
  const lessons = lessonsData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const sections = sectionsData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const stages = stagesData?.data ?? [];

  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

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

  const filteredLessons =
    courseFilter === "all"
      ? lessons
      : lessons.filter((l) => l.course_id === Number(courseFilter));

  function openCreate() {
    setEditingLesson(null);
    setFormOpen(true);
  }

  function openEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">الدروس</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة الدروس وتنظيمها ضمن المقررات.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NativeSelect
              aria-label="تصفية حسب المقرر"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-52"
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
            <Button onClick={openCreate}>
              <Plus />
              إضافة درس
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0 pt-4">
            <LessonsTable
              lessons={filteredLessons}
              courses={courses}
              sections={sections}
              subjects={subjects}
              grades={grades}
              stages={stages}
              isLoading={isLoading || coursesLoading || sectionsLoading || subjectsLoading || gradesLoading || stagesLoading}
              onEdit={openEdit}
              onDelete={setDeletingLesson}
            />
          </CardContent>
        </Card>
      </main>

      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editingLesson}
        courses={courses}
        defaultCourseId={courseFilter === "all" ? undefined : Number(courseFilter)}
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

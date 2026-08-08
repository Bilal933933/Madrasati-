"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { CascadeFilter } from "@/components/shared/cascade-filter";
import { useCascadeFilter, filterLessons } from "@/components/shared/use-cascade-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BankQuestionsTable,
} from "@/features/exams/components/bank-questions-table";
import {
  BankQuestionFormDialog,
} from "@/features/exams/components/bank-question-form-dialog";
import {
  useBankQuestions,
  useDeleteBankQuestion,
} from "@/features/exams/hooks/useBankQuestions";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useSubjects } from "@/features/subjects/hooks/useSubjects";
import { useGrades } from "@/features/grades/hooks/useGrades";
import { useStages } from "@/features/stages/hooks/useStages";
import { useSemesters } from "@/features/semesters/hooks/useSemesters";
import { useLessons } from "@/features/lessons/hooks/useLessons";
import type { BankQuestion } from "@/features/exams/types/exam.types";
import type { Difficulty, QuestionType } from "@/features/exams/types/exam.types";

const ALL_RECORDS = 1000;

export default function AdminBankQuestionsPage() {
  const { data: coursesData, isLoading: coursesLoading } = useCourses({ perPage: ALL_RECORDS });
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects({ perPage: ALL_RECORDS });
  const { data: gradesData, isLoading: gradesLoading } = useGrades();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const { data: semestersData } = useSemesters();
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({ perPage: ALL_RECORDS });

  const filter = useCascadeFilter({
    stages: stagesData?.data ?? [],
    grades: gradesData?.data ?? [],
    semesters: semestersData?.data ?? [],
    subjects: subjectsData?.data ?? [],
    courses: coursesData?.data ?? [],
  });

  const [difficulty, setDifficulty] = useState<string>("all");
  const [questionType, setQuestionType] = useState<string>("all");
  const [lessonId, setLessonId] = useState<string>("all");

  const scopedLessons = filterLessons(lessonsData?.data ?? [], filter.values);
  const lessons = scopedLessons.length > 0 ? scopedLessons : lessonsData?.data ?? [];

  const { data: questionsData, isLoading } = useBankQuestions({
    lessonId: lessonId !== "all" ? Number(lessonId) : undefined,
    difficulty: difficulty !== "all" ? (difficulty as Difficulty) : undefined,
    type: questionType !== "all" ? (questionType as QuestionType) : undefined,
  });

  const deleteQuestion = useDeleteBankQuestion();
  const questions = questionsData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<BankQuestion | null>(null);

  function openCreate() {
    setEditingQuestion(null);
    setFormOpen(true);
  }

  function openEdit(question: BankQuestion) {
    setEditingQuestion(question);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="بنك الأسئلة"
        description="إدارة أسئلة الامتحانات المرتبطة بالدروس."
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus />
            إضافة سؤال
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <CascadeFilter
          filter={filter}
          levels={["stage", "grade", "semester", "subject", "course"]}
        />
        <Select value={lessonId} onValueChange={setLessonId}>
          <SelectTrigger aria-label="تصفية حسب الدرس" className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الدروس</SelectItem>
            {lessons.map((lesson) => (
              <SelectItem key={lesson.id} value={String(lesson.id)}>
                {lesson.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger aria-label="تصفية حسب الصعوبة" className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الصعوبات</SelectItem>
            <SelectItem value="easy">سهل</SelectItem>
            <SelectItem value="medium">متوسط</SelectItem>
            <SelectItem value="hard">صعب</SelectItem>
          </SelectContent>
        </Select>
        <Select value={questionType} onValueChange={setQuestionType}>
          <SelectTrigger aria-label="تصفية حسب النوع" className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="mcq">اختيار من متعدد</SelectItem>
            <SelectItem value="true_false">صح وخطأ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 pt-4">
          <BankQuestionsTable
            questions={questions}
            isLoading={
              isLoading ||
              lessonsLoading ||
              coursesLoading ||
              subjectsLoading ||
              gradesLoading ||
              stagesLoading
            }
            onEdit={openEdit}
            onDelete={setDeletingQuestion}
          />
        </CardContent>
      </Card>

      <BankQuestionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        question={editingQuestion}
        lessons={lessons}
        defaultLessonId={lessonId !== "all" ? Number(lessonId) : undefined}
      />

      <DeleteDialog
        open={deletingQuestion !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingQuestion(null);
        }}
        title="حذف السؤال"
        description="هل أنت متأكد من حذف هذا السؤال؟ سيتم حذفه من بنك الأسئلة نهائيًا."
        isPending={deleteQuestion.isPending}
        onConfirm={() => {
          if (deletingQuestion) {
            deleteQuestion.mutate(deletingQuestion.id, {
              onSuccess: () => setDeletingQuestion(null),
            });
          }
        }}
      />
    </div>
  );
}
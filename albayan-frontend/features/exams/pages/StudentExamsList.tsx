"use client";

import { FileQuestion } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentExams } from "../hooks/useStudentExams";
import { ExamCard } from "../components/student/exam-card";

/** قائمة الامتحانات المتاحة للطالب. */
export function StudentExamsList() {
  const { data, isLoading, isError } = useStudentExams();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const exams = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          الامتحانات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          امتحانات نطاقاتك الدراسية — أكمل دروس النطاق لفتح امتحانه.
        </p>
      </header>

      {exams.length === 0 ? (
        <Empty className="border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion className="size-4" />
            </EmptyMedia>
            <EmptyTitle>لا توجد امتحانات متاحة</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>
              {isError
                ? "تعذّر تحميل الامتحانات. حاول مرة أخرى لاحقًا."
                : "لم تُنشر امتحانات بعد. عد لاحقًا لرؤية امتحاناتك."}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} href={`/exams/${exam.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
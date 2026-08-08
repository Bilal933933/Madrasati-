"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared/loader";
import { useExamAttempt } from "../hooks/useStudentExams";
import { ResultView } from "../components/student/result-view";

/** صفحة نتيجة المحاولة / المراجعة. */
export function ExamResultPage({ attemptId }: { attemptId: number }) {
  const attemptQuery = useExamAttempt(attemptId);
  const attempt = attemptQuery.data?.data;

  if (attemptQuery.isLoading || !attempt) {
    if (attemptQuery.isError) {
      return (
        <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
          <p className="mb-6 text-sm text-foreground">
            تعذّر تحميل النتيجة. أعد المحاولة لاحقًا.
          </p>
          <Button variant="outline" onClick={() => attemptQuery.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      );
    }

    return <Loader className="translate-y-12" />;
  }

  if (attempt.status === "in_progress") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
        <p className="mb-6 text-sm text-muted-foreground">
          هذه المحاولة لا تزال جارية.
        </p>
        <Button asChild className="rounded-xl py-4 text-base font-bold">
          <Link href={`/exams/attempt/${attempt.id}`}>
            <Play className="size-4" aria-hidden />
            متابعة المحاولة
          </Link>
        </Button>
      </div>
    );
  }

  return <ResultView attempt={attempt} />;
}
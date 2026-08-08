"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExamAttempt } from "../hooks/useStudentExams";
import { useAttemptEngine } from "../hooks/useAttemptEngine";
import { ExamHeader } from "../components/student/exam-header";
import { QuestionCard } from "../components/student/question-card";
import { NavigationFooter } from "../components/student/navigation-footer";
import type { ExamAttemptDetail } from "../types/attempt.types";

/** صفحة الأداء — تحميل المحاولة ثم تفويض الرسم لمكوّن المحرك. */
export function TakeExamPage({ attemptId }: { attemptId: number }) {
  const router = useRouter();
  const attemptQuery = useExamAttempt(attemptId);
  const attempt = attemptQuery.data?.data;

  // محاولة مُسلَّمة تصل لهذه الصفحة — نوجّه نحو النتيجة
  useEffect(() => {
    if (attempt && attempt.status === "completed") {
      router.replace(`/exams/result/${attempt.id}`);
    }
  }, [attempt, router]);

  if (attemptQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
        <p className="mb-6 text-sm text-foreground">
          تعذّر تحميل المحاولة. أعد المحاولة لاحقًا.
        </p>
        <Button variant="outline" onClick={() => attemptQuery.refetch()}>
          إعادة التحميل
        </Button>
      </div>
    );
  }

  if (attemptQuery.isLoading || !attempt) {
    return <Loader className="translate-y-12" />;
  }

  if (attempt.status === "completed") {
    return <Loader className="translate-y-12" />;
  }

  return <AttemptWorkspace attempt={attempt} />;
}

/** ورشة الأداء — تُركَّب عند جاهزية المحاولة كي يعمل المحرك بثبات الهوية. */
function AttemptWorkspace({ attempt }: { attempt: ExamAttemptDetail }) {
  const router = useRouter();
  const [showFinish, setShowFinish] = useState(false);

  const engine = useAttemptEngine(attempt, () => {
    router.push(`/exams/result/${attempt.id}`);
  });

  // تذكير قبل مغادرة الصفحة أثناء محاولة جارية
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const question = engine.currentQuestion;

  return (
    <div className="flex min-h-dvh flex-col">
      <ExamHeader
        title={`محاولة ${attempt.attempt_number}`}
        currentIndex={engine.currentIndex}
        totalQuestions={engine.totalQuestions}
        answeredCount={engine.answeredCount}
        remainingSeconds={engine.remainingSeconds}
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        {question && (
          <QuestionCard
            question={question}
            index={engine.currentIndex}
            total={engine.totalQuestions}
            revealed={false}
            selectedOptionId={engine.answers[question.id]?.optionId ?? null}
            selectedBoolean={engine.answers[question.id]?.booleanValue ?? null}
            onSelectOption={(optionId) =>
              engine.selectOption(question.id, optionId)
            }
            onSelectBoolean={(value) =>
              engine.selectBoolean(question.id, value)
            }
          />
        )}
      </main>

      <NavigationFooter
        questions={engine.questions}
        currentIndex={engine.currentIndex}
        answers={engine.answers}
        flagged={engine.flagged}
        answeredCount={engine.answeredCount}
        isSubmitting={engine.isSubmitting}
        isFirst={engine.isFirstQuestion}
        isLast={engine.isLastQuestion}
        onJump={engine.jumpTo}
        onPrev={engine.goToPrevious}
        onNext={engine.goToNext}
        onFinish={() => setShowFinish(true)}
      />

      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent
          onOpenAutoFocus={(event) => event.preventDefault()}
          aria-describedby="finish-attempt-description"
        >
          <DialogHeader>
            <DialogTitle>تأكيد إنهاء الاختبار</DialogTitle>
            <DialogDescription id="finish-attempt-description">
              هل أنت متأكد من إنهاء الاختبار؟ ستُسلَّم كل الإجابات ولن
              تتمكن من العودة وتغييرها.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              autoFocus
              onClick={() => setShowFinish(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={engine.isSubmitting}
              onClick={() => {
                setShowFinish(false);
                engine.submit();
              }}
            >
              <Flag className="ml-1.5 size-4" aria-hidden />
              {engine.isSubmitting ? "جارٍ التسليم…" : "إنهاء وتسليم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { History } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AttemptCard } from "@/features/exams/components/student/attempt-card";
import type { ExamAttemptSummary } from "@/features/exams/types/attempt.types";

/** قسم الامتحانات في "نتائجي" — يستعير بطاقة المحاولات من دومين الامتحانات. */
export function ExamsSection({ attempts }: { attempts: ExamAttemptSummary[] }) {
  if (attempts.length === 0) {
    return (
      <Empty className="border-dashed py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History className="size-4" />
          </EmptyMedia>
          <EmptyTitle>لا توجد محاولات بعد</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            ابدأ امتحانًا لتظهر نتائجه هنا.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {attempts.map((attempt, index) => (
        <AttemptCard
          key={attempt.id}
          attempt={attempt}
          index={index}
          resultHref={`/exams/result/${attempt.id}`}
          continueHref={`/exams/attempt/${attempt.id}`}
        />
      ))}
    </div>
  );
}

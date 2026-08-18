import { ExamResultPage } from "@/features/exams/pages/ExamResultPage";

export default async function ExamResultRoute({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <ExamResultPage attemptId={Number(attemptId)} />;
}
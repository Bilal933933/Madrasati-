import { TakeExamPage } from "@/features/exams/pages/TakeExamPage";

export default async function AttemptRoute({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <TakeExamPage attemptId={Number(attemptId)} />;
}
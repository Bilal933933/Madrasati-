import { ExamDetailPage } from "@/features/exams/pages/ExamDetailPage";

export default async function ExamDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamDetailPage examId={Number(id)} />;
}
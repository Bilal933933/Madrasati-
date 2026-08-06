import { GradePage } from "@/features/explore/pages/GradePage";

export default async function GradeRoute({
  params,
}: {
  params: Promise<{ stage: string; grade: string }>;
}) {
  const { stage, grade } = await params;
  return <GradePage stageKey={stage} gradeKey={grade} />;
}
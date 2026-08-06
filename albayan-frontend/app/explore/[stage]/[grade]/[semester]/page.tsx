import { SemesterPage } from "@/features/explore/pages/SemesterPage";

export default async function SemesterRoute({
  params,
}: {
  params: Promise<{ stage: string; grade: string; semester: string }>;
}) {
  const { stage, grade, semester } = await params;
  return <SemesterPage stageKey={stage} gradeKey={grade} semesterKey={semester} />;
}
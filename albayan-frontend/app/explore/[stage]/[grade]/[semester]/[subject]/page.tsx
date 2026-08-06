import { SubjectPage } from "@/features/explore/pages/SubjectPage";

export default async function SubjectRoute({
  params,
}: {
  params: Promise<{ stage: string; grade: string; semester: string; subject: string }>;
}) {
  const { subject } = await params;
  return <SubjectPage subjectSlug={subject} />;
}
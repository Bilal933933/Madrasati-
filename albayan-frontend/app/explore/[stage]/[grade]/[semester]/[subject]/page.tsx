import { SubjectPage } from "@/features/explore/pages/SubjectPage";
import { TrackContext } from "@/features/explore/components/TrackContext";

export default async function SubjectRoute({
  params,
}: {
  params: Promise<{ stage: string; grade: string; semester: string; subject: string }>;
}) {
  const { subject } = await params;
  return (
    <>
      <TrackContext subjectSlug={subject} />
      <SubjectPage subjectSlug={subject} />
    </>
  );
}

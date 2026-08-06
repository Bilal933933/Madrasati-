import { LessonPreviewPage } from "@/features/explore/pages/LessonPreviewPage";

export default async function LessonPreviewRoute({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  return <LessonPreviewPage lessonSlug={lessonSlug} />;
}
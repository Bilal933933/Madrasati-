import type { Metadata } from "next";
import { LessonPreviewPage } from "@/features/explore/pages/LessonPreviewPage";
import { throwIfNotFound } from "@/features/explore/lib/explore";
import { exploreApi } from "@/features/explore/services/exploreApi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}): Promise<Metadata> {
  const { lessonSlug } = await params;

  let data;
  try {
    data = await exploreApi.lessonPreview(lessonSlug);
  } catch (error) {
    throwIfNotFound(error);
  }

  const lesson = data.data;

  return {
    title: lesson.title,
    description:
      lesson.description ??
      `${lesson.subject ?? "درس"} — ${lesson.duration} دقيقة، ${lesson.blocks_count} أجزاء. جرّب أول درس مجانًا دون تسجيل.`,
  };
}

export default async function LessonPreviewRoute({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  return <LessonPreviewPage lessonSlug={lessonSlug} />;
}

"use client";

import { useParams } from "next/navigation";
import { LessonPlayer } from "@/features/lesson-engine/components/lesson-player";

export default function LearnLessonPage() {
  const params = useParams<{ lessonSlug: string }>();

  return <LessonPlayer lessonSlug={params.lessonSlug} />;
}
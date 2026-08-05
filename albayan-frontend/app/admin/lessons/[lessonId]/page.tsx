"use client";

import { useParams } from "next/navigation";
import { LessonBuilder } from "@/features/lesson-builder/components/LessonBuilder";

export default function AdminLessonBuilderPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = Number(params.lessonId);

  return <LessonBuilder lessonId={lessonId} />;
}
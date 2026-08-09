"use client";

import { useParams } from "next/navigation";
import { LessonPlayer } from "@/features/lesson-engine/components/lesson-player";

export default function LearnLessonPage() {
  const params = useParams<{ lessonSlug: string }>();

  // key تُعيد تركيب LessonPlayer بالكامل عند التنقل من درس إلى آخر
  // (مثلاً من شاشة النهاية «ابدأ الدرس التالي») لتهيئة محرك جديد.
  return <LessonPlayer key={params.lessonSlug} lessonSlug={params.lessonSlug} />;
}
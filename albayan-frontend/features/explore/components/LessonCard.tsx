import { Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { ExploreThumb } from "./ExploreThumb";
import type { ExploreLesson } from "../types/explore.types";

/**
 * صف درس داخل الوحدة — يعرض المدة والمحتوى ويربط بصفحة المعاينة.
 */
export function LessonCard({ lesson }: { lesson: ExploreLesson }) {
  return (
    <Link
      href={`/lessons/${lesson.slug}/preview`}
      className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <ExploreThumb
        image={lesson.image}
        className="size-9 rounded-lg"
        alt={lesson.title}
        fallback={<PlayCircle className="size-5 shrink-0 text-primary" />}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{lesson.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {lesson.blocks_count} أجزاء
        </p>
      </div>

      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        {lesson.duration} دقيقة
      </span>
    </Link>
  );
}

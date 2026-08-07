import { Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { ExploreLesson } from "../types/explore.types";

/**
 * صف درس داخل الوحدة — يوضح المدة والمحتوى ويربط بصفحة المعاينة.
 * نمط انسيابي بلا إطار، يتلون بالثيم عند التمرير.
 */
export function LessonCard({ lesson }: { lesson: ExploreLesson }) {
  return (
    <Link
      href={`/lessons/${lesson.slug}/preview`}
      className="group flex items-center gap-4 py-3 transition-colors"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PlayCircle className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium transition-colors group-hover:text-primary">
          {lesson.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{lesson.blocks_count} أجزاء</p>
      </div>

      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        {lesson.duration} دقيقة
      </span>
    </Link>
  );
}
import { ChevronDown } from "lucide-react";
import type { ExploreUnit } from "../types/explore.types";
import { ExploreThumb } from "./ExploreThumb";
import { LessonCard } from "./LessonCard";

/**
 * أكورديون وحدة دراسية قابل للتوسيع (بلا JavaScript عبر <details>)
 * — يسرد دروس الوحدة داخل بطاقة.
 */
export function CourseAccordion({ unit }: { unit: ExploreUnit }) {
  return (
    <details className="group rounded-2xl border bg-card open:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <ExploreThumb
            image={unit.image}
            className="size-10 rounded-lg"
            alt={unit.name}
            fallback={null}
          />
          <div className="min-w-0">
            <h3 className="font-bold">{unit.name}</h3>
            {unit.description && (
              <p className="mt-1 text-sm text-muted-foreground">{unit.description}</p>
            )}
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {unit.lessons.length} دروس
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>

      <div className="flex flex-col gap-2 border-t px-4 py-4">
        {unit.lessons.length > 0 ? (
          unit.lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
        ) : (
          <p className="py-2 text-center text-sm text-muted-foreground">لا توجد دروس بعد.</p>
        )}
      </div>
    </details>
  );
}
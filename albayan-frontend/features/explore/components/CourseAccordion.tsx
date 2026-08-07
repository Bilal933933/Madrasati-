import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXPLORE_ICONS } from "../lib/exploreIcons";
import type { ExploreUnit } from "../types/explore.types";
import { ExploreThumb } from "./ExploreThumb";
import { LessonCard } from "./LessonCard";

/**
 * وحدة دراسية داخل صفحة المادة — بطاقة متناوبة بنمط أقسام /home:
 * صورة في جانب ومعلومات في المقابل، تتوسّع لعرض الدروس (بلا JavaScript عبر <details>).
 */
export function CourseAccordion({ unit, index }: { unit: ExploreUnit; index: number }) {
  const isEven = index % 2 === 0;
  const Icon = EXPLORE_ICONS[unit.icon ?? ""] ?? Layers;

  return (
    <details className="group overflow-hidden">
      <summary className="grid cursor-pointer list-none grid-cols-1 items-center gap-6 py-2 [&::-webkit-details-marker]:hidden lg:grid-cols-12">
        {/* الصورة / الكولباك — تُعرض دائمًا */}
        <div
          className={cn(
            "relative col-span-1 aspect-[16/10] overflow-hidden rounded-3xl lg:col-span-7 lg:aspect-auto lg:min-h-64",
            isEven ? "lg:order-2" : "lg:order-1",
          )}
        >
          <ExploreThumb
            image={unit.image}
            fallbackImage="/images/subject-fallback.jpg"
            className="absolute inset-0 size-full rounded-none object-cover"
            alt={unit.name}
            fallback={
              <span className="absolute inset-0 flex items-center justify-center bg-muted">
                <Icon className="size-16 text-muted-foreground" aria-hidden />
              </span>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
        </div>

        {/* المحتوى */}
        <div
          className={cn(
            "flex flex-col gap-3 p-2 lg:col-span-5",
            isEven ? "lg:order-1 lg:pe-10" : "lg:order-2 lg:ps-10",
          )}
        >
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Icon className="me-1.5 size-3.5" aria-hidden />
            وحدة دراسية
          </span>
          <h3 className="text-2xl font-black tracking-tight">{unit.name}</h3>
          {unit.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{unit.description}</p>
          )}
          <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-primary">
            {unit.lessons.length} دروس
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </span>
        </div>
      </summary>

      <div className="mt-3 flex flex-col border-t border-border/50 pb-2 ps-2 pe-2 lg:mt-6 lg:ps-12 lg:pe-12">
        {unit.lessons.length > 0 ? (
          unit.lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">لا توجد دروس بعد.</p>
        )}
      </div>
    </details>
  );
}
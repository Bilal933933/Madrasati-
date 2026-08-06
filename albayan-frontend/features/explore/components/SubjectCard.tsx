import { Layers, Library } from "lucide-react";
import Link from "next/link";
import { ExploreThumb } from "./ExploreThumb";
import { EXPLORE_ICONS } from "../lib/exploreIcons";
import type { ExploreSubjectSummary } from "../types/explore.types";

/**
 * بطاقة مادة دراسية — عرض تنوع المحتوى (وحدات/دروس) وربط بصفحة المادة.
 */
export function SubjectCard({
  stageKey,
  gradeKey,
  semesterKey,
  subject,
}: {
  stageKey: string;
  gradeKey: string;
  semesterKey: string;
  subject: ExploreSubjectSummary;
}) {
  const Icon = EXPLORE_ICONS[subject.icon ?? ""] ?? Library;

  return (
    <Link
      href={`/explore/${stageKey}/${gradeKey}/${semesterKey}/${subject.slug}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <ExploreThumb
        image={subject.image}
        className="size-14 rounded-xl"
        alt={subject.name}
        fallback={
          <span
            className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl"
            style={{ backgroundColor: subject.color ?? undefined, color: "#fff" }}
          >
            <Icon className="size-6" />
          </span>
        }
      />

      <div>
        <h2 className="text-lg font-bold">{subject.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{subject.description}</p>
      </div>

      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="size-3.5" />
          {subject.units_count} وحدات
        </span>
        <span className="flex items-center gap-1">
          <Library className="size-3.5" />
          {subject.lessons_count} دروس
        </span>
      </div>
    </Link>
  );
}

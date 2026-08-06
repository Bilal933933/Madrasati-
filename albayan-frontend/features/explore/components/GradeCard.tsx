import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ExploreThumb } from "./ExploreThumb";
import { EXPLORE_ICONS } from "../lib/exploreIcons";
import type { ExploreGrade } from "../types/explore.types";

/**
 * بطاقة صف دراسي — تقود الزائر إلى فصوله (الأول/الثاني).
 */
export function GradeCard({
  stageKey,
  grade,
}: {
  stageKey: string;
  grade: ExploreGrade;
}) {
  const Icon = EXPLORE_ICONS[grade.icon ?? ""] ?? GraduationCap;

  return (
    <Link
      href={`/explore/${stageKey}/${grade.key}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <ExploreThumb
        image={grade.image}
        className="size-14 rounded-xl"
        alt={grade.name}
        fallback={
          <span
            className="flex size-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: grade.color ?? undefined, color: "#fff" }}
          >
            <Icon className="size-5" />
          </span>
        }
      />

      <div>
        <h2 className="text-lg font-bold">{grade.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{grade.semesters_count} فصول دراسية</p>
      </div>
    </Link>
  );
}

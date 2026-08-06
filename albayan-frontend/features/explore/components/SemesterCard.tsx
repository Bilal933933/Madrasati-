import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { ExploreSemester } from "../types/explore.types";

/**
 * بطاقة فصل دراسي — تقود الزائر إلى مواد الفصل.
 */
export function SemesterCard({
  stageKey,
  gradeKey,
  semester,
}: {
  stageKey: string;
  gradeKey: string;
  semester: ExploreSemester;
}) {
  return (
    <Link
      href={`/explore/${stageKey}/${gradeKey}/${semester.key}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BookOpen className="size-5" />
      </span>

      <div>
        <h2 className="text-lg font-bold">{semester.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{semester.subjects_count} مواد دراسية</p>
      </div>
    </Link>
  );
}

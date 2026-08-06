import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { SemesterCard } from "../components/SemesterCard";
import { gradeName, stageName, throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الثالث — فصول صف معين (الأول/الثاني).
 */
export async function GradePage({
  stageKey,
  gradeKey,
}: {
  stageKey: string;
  gradeKey: string;
}) {
  let data;
  try {
    data = await exploreApi.semesters(stageKey, gradeKey);
  } catch (error) {
    throwIfNotFound(error);
  }

  const [stage, grade] = await Promise.all([
    stageName(stageKey).catch(() => stageKey),
    gradeName(stageKey, gradeKey).catch(() => gradeKey),
  ]);

  return (
    <ExploreShell>
      <ExploreBreadcrumb
        items={[
          { label: "استكشف المواد", href: "/explore" },
          { label: stage, href: `/explore/${stageKey}` },
          { label: grade, href: `/explore/${stageKey}/${gradeKey}` },
        ]}
      />

      <div className="mt-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{grade}</h1>
        <p className="mt-2 text-muted-foreground">اختر الفصل الدراسي الذي تريد استعراضه.</p>
      </div>

      {data.data.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((semester) => (
            <SemesterCard
              key={semester.key}
              stageKey={stageKey}
              gradeKey={gradeKey}
              semester={semester}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">لا توجد فصول دراسية بعد.</p>
      )}
    </ExploreShell>
  );
}
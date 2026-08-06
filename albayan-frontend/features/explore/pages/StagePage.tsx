import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { GradeCard } from "../components/GradeCard";
import { stageName, throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الثاني — صفوف مرحلة معينة.
 */
export async function StagePage({ stageKey }: { stageKey: string }) {
  let data;
  try {
    data = await exploreApi.grades(stageKey);
  } catch (error) {
    throwIfNotFound(error);
  }

  const parent = await stageName(stageKey).catch(() => stageKey);

  return (
    <ExploreShell>
      <ExploreBreadcrumb
        items={[
          { label: "استكشف المواد", href: "/explore" },
          { label: parent, href: `/explore/${stageKey}` },
        ]}
      />

      <div className="mt-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{parent}</h1>
        <p className="mt-2 text-muted-foreground">اختر صفك الدراسي لعرض فصوله ومواده.</p>
      </div>

      {data.data.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((grade) => (
            <GradeCard key={grade.key} stageKey={stageKey} grade={grade} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">لا توجد صفوف دراسية بعد.</p>
      )}
    </ExploreShell>
  );
}
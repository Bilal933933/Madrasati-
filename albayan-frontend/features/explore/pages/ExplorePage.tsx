import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { StageCard } from "../components/StageCard";
import { throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الأول — اختيار المرحلة الدراسية.
 */
export async function ExplorePage() {
  let data;
  try {
    data = await exploreApi.stages();
  } catch (error) {
    throwIfNotFound(error);
  }

  return (
    <ExploreShell>
      <ExploreBreadcrumb items={[{ label: "استكشف المواد", href: "/explore" }]} />

      <div className="mt-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">استكشف المناهج</h1>
        <p className="mt-2 text-muted-foreground">
          ابدأ باختيار مرحلتك الدراسية لنستعرض لك المواد والدروس المناسبة.
        </p>
      </div>

      {data.data.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((stage) => (
            <StageCard key={stage.key} stage={stage} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">لا توجد مراحل دراسية بعد.</p>
      )}
    </ExploreShell>
  );
}

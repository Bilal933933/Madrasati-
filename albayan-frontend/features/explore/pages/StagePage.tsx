import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreHero } from "../components/ExploreHero";
import { ExploreItemCard } from "../components/ExploreItemCard";
import { ExploreShell } from "../components/ExploreShell";
import { stageName, throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الثاني — صفوف مرحلة معينة بنمط بطاقات متناوبة كأقسام /home.
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

      <ExploreHero
        badge="المرحلة"
        title={parent}
        description="اختر صفك الدراسي لعرض فصوله وموادها."
      />

      {data.data.length > 0 ? (
        <div className="mt-10 flex flex-col gap-14">
          {data.data.map((grade, index) => (
            <ExploreItemCard
              key={grade.key}
              index={index}
              href={`/explore/${stageKey}/${grade.key}`}
              title={grade.name}
              description={`${grade.semesters_count} فصول دراسية متاحة ضمن هذا الصف.`}
              meta="صف دراسي"
              image={grade.image}
              icon={grade.icon}
              color={grade.color}
            />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-muted-foreground">لا توجد صفوف دراسية بعد.</p>
      )}
    </ExploreShell>
  );
}
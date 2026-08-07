import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreHero } from "../components/ExploreHero";
import { ExploreItemCard } from "../components/ExploreItemCard";
import { ExploreShell } from "../components/ExploreShell";
import { throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الأول — مراحل دراسية بنمط بطاقات متناوبة (معلومة/صورة) كأقسام /home.
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

      <ExploreHero
        badge="استكشاف"
        title="استكشف المناهج"
        description="ابدأ باختيار مرحلتك الدراسية لنستعرض لك المواد والدروس المناسبة."
      />

      {data.data.length > 0 ? (
        <div className="mt-10 flex flex-col gap-14">
          {data.data.map((stage, index) => (
            <ExploreItemCard
              key={stage.key}
              index={index}
              href={`/explore/${stage.key}`}
              title={stage.name}
              description={`${stage.grades_count} صفوف دراسية متاحة ضمن هذه المرحلة.`}
              meta="مرحلة دراسية"
              image={stage.image}
              icon={stage.icon}
              color={stage.color}
            />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-muted-foreground">لا توجد مراحل دراسية بعد.</p>
      )}
    </ExploreShell>
  );
}
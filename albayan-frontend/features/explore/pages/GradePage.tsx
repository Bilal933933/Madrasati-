import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreHero } from "../components/ExploreHero";
import { ExploreItemCard } from "../components/ExploreItemCard";
import { ExploreShell } from "../components/ExploreShell";
import { gradeName, stageName, throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الثالث — فصول صف معين بنمط بطاقات متناوبة كأقسام /home.
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

      <ExploreHero
        badge="الصف"
        title={grade}
        description="اختر الفصل الدراسي الذي تريد استعراضه."
      />

      {data.data.length > 0 ? (
        <div className="mt-10 flex flex-col gap-14">
          {data.data.map((semester, index) => (
            <ExploreItemCard
              key={semester.key}
              index={index}
              href={`/explore/${stageKey}/${gradeKey}/${semester.key}`}
              title={semester.name}
              description={`${semester.subjects_count} مواد دراسية متاحة ضمن هذا الفصل.`}
              meta="الفصل الدراسي"
              image={null}
              icon={null}
              color={null}
            />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-muted-foreground">لا توجد فصول دراسية بعد.</p>
      )}
    </ExploreShell>
  );
}
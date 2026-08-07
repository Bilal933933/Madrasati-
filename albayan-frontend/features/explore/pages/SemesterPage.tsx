import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreHero } from "../components/ExploreHero";
import { ExploreItemCard } from "../components/ExploreItemCard";
import { ExploreShell } from "../components/ExploreShell";
import { gradeName, semesterName, stageName, throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الرابع — مواد فصل دراسي بنمط بطاقات متناوبة كأقسام /home.
 */
export async function SemesterPage({
  stageKey,
  gradeKey,
  semesterKey,
}: {
  stageKey: string;
  gradeKey: string;
  semesterKey: string;
}) {
  let data;
  try {
    data = await exploreApi.subjects(stageKey, gradeKey, semesterKey);
  } catch (error) {
    throwIfNotFound(error);
  }

  const [stage, grade, semester] = await Promise.all([
    stageName(stageKey).catch(() => stageKey),
    gradeName(stageKey, gradeKey).catch(() => gradeKey),
    semesterName(stageKey, gradeKey, semesterKey).catch(() => semesterKey),
  ]);

  return (
    <ExploreShell>
      <ExploreBreadcrumb
        items={[
          { label: "استكشف المواد", href: "/explore" },
          { label: stage, href: `/explore/${stageKey}` },
          { label: grade, href: `/explore/${stageKey}/${gradeKey}` },
          { label: semester, href: `/explore/${stageKey}/${gradeKey}/${semesterKey}` },
        ]}
      />

      <ExploreHero
        badge="الفصل الدراسي"
        title={semester}
        description={`استعرض مواد ${grade} — ${semester}.`}
      />

      {data.data.length > 0 ? (
        <div className="mt-10 flex flex-col gap-14">
          {data.data.map((subject, index) => (
            <ExploreItemCard
              key={subject.slug}
              index={index}
              href={`/explore/${stageKey}/${gradeKey}/${semesterKey}/${subject.slug}`}
              title={subject.name}
              description={subject.description}
              meta={`${subject.units_count} وحدات · ${subject.lessons_count} دروس`}
              image={subject.image}
              icon={subject.icon}
              color={subject.color}
            />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-muted-foreground">لا توجد مواد في هذا الفصل بعد.</p>
      )}
    </ExploreShell>
  );
}
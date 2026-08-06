import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { SubjectCard } from "../components/SubjectCard";
import { gradeName, semesterName, stageName, throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الرابع — مواد فصل دراسي معين.
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

      <div className="mt-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{semester}</h1>
        <p className="mt-2 text-muted-foreground">استعرض مواد {grade} — {semester}.</p>
      </div>

      {data.data.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((subject) => (
            <SubjectCard
              key={subject.slug}
              stageKey={stageKey}
              gradeKey={gradeKey}
              semesterKey={semesterKey}
              subject={subject}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">لا توجد مواد في هذا الفصل بعد.</p>
      )}
    </ExploreShell>
  );
}
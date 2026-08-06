import { Layers, Library } from "lucide-react";
import { CourseAccordion } from "../components/CourseAccordion";
import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { ExploreThumb } from "../components/ExploreThumb";
import { EXPLORE_ICONS } from "../lib/exploreIcons";
import { throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الخامس — مادة دراسية تعرض وحداتها ودروسها.
 * تُجلب بمفتاح المادة (slug) لدعم الدخول المباشر من أي مستوى.
 */
export async function SubjectPage({ subjectSlug }: { subjectSlug: string }) {
  let data;
  try {
    data = await exploreApi.subject(subjectSlug);
  } catch (error) {
    throwIfNotFound(error);
  }

  const subject = data.data;
  const Icon = EXPLORE_ICONS[subject.icon ?? ""] ?? Library;

  return (
    <ExploreShell>
      <ExploreBreadcrumb
        items={[
          { label: "استكشف المواد", href: "/explore" },
          { label: subject.name, href: "" },
        ]}
      />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <ExploreThumb
          image={subject.image}
          className="size-20 rounded-2xl"
          alt={subject.name}
          fallback={
            <span
              className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-3xl"
              style={{ backgroundColor: subject.color ?? undefined, color: "#fff" }}
            >
              <Icon className="size-7" />
            </span>
          }
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{subject.name}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{subject.description}</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="size-4" />
              {subject.units_count} وحدات
            </span>
            <span className="flex items-center gap-1">
              <Library className="size-4" />
              {subject.lessons_count} دروس
            </span>
          </div>
        </div>
      </div>

      {subject.units.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {subject.units.map((unit) => (
            <CourseAccordion key={unit.id} unit={unit} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">لا توجد وحدات لهذه المادة بعد.</p>
      )}
    </ExploreShell>
  );
}
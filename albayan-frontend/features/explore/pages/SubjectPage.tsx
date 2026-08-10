import { Layers } from "lucide-react";
import { CourseAccordion } from "../components/CourseAccordion";
import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { ExploreThumb } from "../components/ExploreThumb";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * المستوى الخامس — مادة دراسية بنمط Open Canvas انسيابي (نفس لغة صفحة
 * المادة في بيت الطالب): غلاف عائم بتوهّج + إحصاءات نصية + مقررات متباعدة
 * بلا إطارات.
 */
export async function SubjectPage({ subjectSlug }: { subjectSlug: string }) {
  let data;
  try {
    data = await exploreApi.subject(subjectSlug);
  } catch (error) {
    throwIfNotFound(error);
  }

  const subject = data.data;

  return (
    <ExploreShell>
      <ExploreBreadcrumb
        items={[
          { label: "استكشف المواد", href: "/explore" },
          { label: subject.name, href: "" },
        ]}
      />

      {/* غلاف المادة — Hero: يمين=نص (5) | يسار=صورة متلاشية (7) */}
      <ScrollReveal className="relative mt-6 overflow-hidden">
        <div className="pointer-events-none absolute end-1/3 top-10 size-72 rounded-full bg-primary/15 opacity-40 blur-3xl" />

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
              مادة دراسية
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              {subject.name}
            </h1>
            {subject.description ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {subject.description}
              </p>
            ) : null}

            <div className="mt-5 inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{subject.units_count}</span> وحدات
              </span>
              <span aria-hidden className="text-muted-foreground/50">•</span>
              <span>
                <span className="font-semibold text-foreground">{subject.lessons_count}</span> دروس
              </span>
            </div>
          </div>

          <div className="relative col-span-1 aspect-[16/9] w-full overflow-hidden rounded-2xl lg:aspect-auto lg:col-span-7 lg:h-96 lg:rounded-none">
            <ExploreThumb
              image={subject.image}
              fallbackImage="/images/subject-fallback.jpg"
              className="absolute inset-0 size-full rounded-none object-cover"
              alt={subject.name}
              fallback={
                <span className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Layers className="size-24 text-muted-foreground" aria-hidden />
                </span>
              }
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/60 to-transparent lg:h-24 lg:from-background" />
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent to-background lg:block" />
          </div>
        </div>
      </ScrollReveal>

      {/* فاصل ناعم بالتدرج */}
      <ScrollReveal className="mt-14 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border/60 to-transparent" />
        <p className="px-3 text-xs font-semibold text-muted-foreground">وحدات {subject.name}</p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </ScrollReveal>

      {subject.units.length > 0 ? (
        <div className="mt-10 flex flex-col gap-14">
          {subject.units.map((unit, index) => (
            <CourseAccordion key={unit.id} unit={unit} index={index} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-muted-foreground">لا توجد وحدات لهذه المادة بعد.</p>
      )}
    </ExploreShell>
  );
}
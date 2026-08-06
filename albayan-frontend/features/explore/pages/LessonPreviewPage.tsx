import { CheckCircle2, Clock, Layers, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { imageUrl } from "@/lib/image";
import { ExploreBreadcrumb } from "../components/ExploreBreadcrumb";
import { ExploreShell } from "../components/ExploreShell";
import { throwIfNotFound } from "../lib/explore";
import { exploreApi } from "../services/exploreApi";

/**
 * معاينة الدرس — نظرة تعريفية (أهداف/مدة/محتويات) قبل خوض الدرس.
 * مستقلة وقابلة لإعادة الاستخدام من أي مكان.
 */
export async function LessonPreviewPage({ lessonSlug }: { lessonSlug: string }) {
  let data;
  try {
    data = await exploreApi.lessonPreview(lessonSlug);
  } catch (error) {
    throwIfNotFound(error);
  }

  const lesson = data.data;
  const objectives = lesson.learning_objectives ?? [];

  return (
    <ExploreShell>
      <ExploreBreadcrumb
        items={[
          { label: "استكشف المواد", href: "/explore" },
          ...(lesson.subject ? [{ label: lesson.subject, href: "" }] : []),
        ]}
      />

      <div className="mx-auto mt-6 max-w-3xl">
        {lesson.image && imageUrl(lesson.image) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl(lesson.image) ?? ""}
            alt={lesson.title}
            className="mb-5 h-40 w-full rounded-2xl object-cover sm:h-56"
          />
        )}
        <p className="text-sm text-muted-foreground">
          {lesson.subject} {lesson.unit ? `• ${lesson.unit}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {lesson.duration} دقيقة
          </span>
          <span className="flex items-center gap-1">
            <Layers className="size-4" />
            {lesson.blocks_count} أجزاء
          </span>
          <span className="flex items-center gap-1">
            <ListChecks className="size-4" />
            {lesson.assessment_count} تقييمات
          </span>
        </div>

        {lesson.description && (
          <p className="mt-4 leading-relaxed text-muted-foreground">{lesson.description}</p>
        )}

        {objectives.length > 0 && (
          <section className="mt-6 rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-bold">ستتعلم في هذا الدرس</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {objective}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href="/trial">ابدأ التجربة</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
            <Link href="/explore">العودة لاستكشاف المواد</Link>
          </Button>
        </div>
      </div>
    </ExploreShell>
  );
}
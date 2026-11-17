import { ArrowLeft, Boxes, Clock3 } from "lucide-react";
import Link from "next/link";
import { SCENE_LESSONS } from "@/features/lab-sandbox/mock/lessons";
import { getScene } from "@/features/lab-sandbox/scene/scenes";

/** فهرس عشرة دروس بعشرة مشاهد — بيانات ثابتة، بلا شبكة */
export default function SceneLessonsIndexRoute() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
          <Boxes className="size-3.5 text-amber-500" aria-hidden />
          بيئة معزولة · عشرة مشاهد لعشر مواد
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold">دروس بمشاهد ثلاثية الأبعاد</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          كل درس فقرة واحدة تحوي عقدة مشهد. المشهد كله بيانات JSON، والقارئ واحد — التنوّع من
          البيانات لا من الكود.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENE_LESSONS.map((lesson) => {
          const scene = getScene(lesson.sceneId);
          return (
            <li key={lesson.id}>
              <Link
                href={`/sandbox/scenes/${lesson.id}`}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-amber-500/40 hover:bg-muted/40"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {lesson.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <Clock3 className="size-3" aria-hidden />
                    {lesson.minutes} د
                  </span>
                </span>

                <span className="font-heading text-base font-bold leading-tight">{lesson.title}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {scene?.summary ?? scene?.title}
                </span>

                <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-foreground">
                  افتح الدرس
                  <ArrowLeft className="size-3" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-[11px] font-semibold text-muted-foreground">
        المجموع: {SCENE_LESSONS.length} دروس · {SCENE_LESSONS.length} مشاهد مختلفة · مادة واحدة لكل درس
      </p>
    </div>
  );
}

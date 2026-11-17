import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SandboxRichContent } from "@/features/lab-sandbox/components/sandbox-rich-content";
import { getSceneLesson, lessonDoc, SCENE_LESSONS } from "@/features/lab-sandbox/mock/lessons";

/** قارئ درس واحد: فقرة + مشهد — ملف إضافي بحت داخل app/sandbox */
export default async function SceneLessonRoute({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getSceneLesson(lessonId);
  if (!lesson) notFound();

  const index = SCENE_LESSONS.findIndex((item) => item.id === lesson.id);
  const previous = SCENE_LESSONS[index - 1];
  const next = SCENE_LESSONS[index + 1];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mx-auto mb-5 w-full max-w-2xl">
        <Link
          href="/sandbox/scenes"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3" aria-hidden />
          كل الدروس
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          <span className="rounded-full border border-primary/25 bg-primary/5 px-2 py-0.5 text-primary">
            {lesson.subject}
          </span>
          <span>{lesson.grade}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3" aria-hidden />
            {lesson.minutes} دقيقة
          </span>
        </div>

        <h1 className="mt-2 font-heading text-2xl font-bold leading-tight">{lesson.title}</h1>
      </div>

      <SandboxRichContent doc={lessonDoc(lesson)} labSize="stage" />

      <nav className="mx-auto mt-6 flex w-full max-w-2xl items-center justify-between gap-3 border-t border-border pt-4">
        {previous ? (
          <Link
            href={`/sandbox/scenes/${previous.id}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-3" aria-hidden />
            {previous.title}
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/sandbox/scenes/${next.id}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            {next.title}
            <ArrowLeft className="size-3" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

"use client";

import { RichLessonContent } from "@/components/shared/rich-lesson-content";
import type { TiptapDoc } from "@/features/lesson-engine/engine/tiptap-types";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";

/**
 * شاشة المحتوى — شاشة معاد استخدامها تعرض أي كتلة محتوى:
 * switch(block.kind) → فقرة/فيديو (وتُضاف لاحقًا صورة/جدول/اقتباس/مثال).
 * تستهلك `current.content.data` فقط ولا تعرف الرحلة حولها.
 */
export function ContentStage() {
  const current = useLessonEngineStore((s) => s.current);

  const content = current?.content?.type === "content" ? current.content.data : null;

  if (!content) {
    return <p className="py-8 text-center text-sm text-muted-foreground">لا يوجد محتوى هنا.</p>;
  }

  if (content.kind === "lesson_video") {
    return <VideoContent url={content.url} />;
  }

  return <ParagraphContent title={content.title} doc={content.content} image={content.image} />;
}

function ParagraphContent({
  title,
  doc,
  image,
}: {
  title?: string | null;
  doc?: TiptapDoc | null;
  image?: string | null;
}) {
  return (
    <article className="flex flex-col gap-4">
      {title && <h2 className="text-2xl font-bold leading-tight">{title}</h2>}
      {image && <img src={image} alt={title ?? "صورة"} className="h-auto w-full rounded-xl object-cover" />}
      <RichLessonContent doc={doc ?? null} />
    </article>
  );
}

function VideoContent({ url }: { url?: string | null }) {
  if (!url) {
    return <p className="py-8 text-center text-sm text-muted-foreground">لا يوجد فيديو في هذه الكتلة.</p>;
  }
  return <video className="w-full rounded-xl" controls preload="metadata" src={url} />;
}

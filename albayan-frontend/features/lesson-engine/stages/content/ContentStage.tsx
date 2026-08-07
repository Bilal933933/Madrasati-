"use client";

import { ImageIcon } from "lucide-react";
import { RichLessonContent } from "@/components/shared/rich-lesson-content";
import { ExploreThumb } from "@/features/explore/components/ExploreThumb";
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
    return <VideoContent url={content.url} embed={content.embed} />;
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
    <article className="flex flex-col gap-5">
      {title && (
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h2>
      )}
      <ExploreThumb
        image={image}
        fallbackImage="/images/lesson-fallback.jpg"
        className="h-auto w-full rounded-xl object-cover"
        alt={title ?? "صورة"}
        fallback={
          <span className="flex h-auto min-h-48 w-full items-center justify-center rounded-xl bg-muted">
            <ImageIcon className="size-10 text-muted-foreground" aria-hidden />
          </span>
        }
      />
      <RichLessonContent doc={doc ?? null} className="text-base leading-relaxed" />
    </article>
  );
}

function VideoContent({ url, embed }: { url?: string | null; embed?: string | null }) {
  if (!url && !embed) {
    return <p className="py-8 text-center text-sm text-muted-foreground">لا يوجد فيديو في هذه الكتلة.</p>;
  }

  // الباك يسلّم video_embed (iframe يوتيوب)؛ نعرضه مباشرة، مع <video> كـ fallback.
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black">
        <iframe
          src={embed}
          title="فيديو الدرس"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }
  return <video className="w-full rounded-xl" controls preload="metadata" src={url ?? undefined} />;
}

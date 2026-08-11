"use client";

import { ImageIcon, Play } from "lucide-react";
import { useState } from "react";
import { RichLessonContent } from "@/components/shared/rich-lesson-content";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
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
    return (
      <ScrollReveal className="flex flex-1 flex-col justify-center">
        <VideoContent url={content.url} embed={content.embed} />
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal className="flex flex-1 flex-col">
      <ParagraphContent
        title={content.title}
        doc={content.content}
        image={content.image}
        url={content.url}
        embed={content.embed}
      />
    </ScrollReveal>
  );
}

function ParagraphContent({
  title,
  doc,
  image,
  url,
  embed,
}: {
  title?: string | null;
  doc?: TiptapDoc | null;
  image?: string | null;
  url?: string | null;
  embed?: string | null;
}) {
  // وجود فيديو مرتبط بالفقرة يُفعّل زر التبديل (صورة/فيديو).
  const hasVideo = Boolean(url || embed);
  const [media, setMedia] = useState<"image" | "video">("image");

  return (
    <article className="flex flex-1 flex-col">
      {/* العنوان يعتلي الوسيط والنص */}
      {title && (
        <h2 className="mb-6 text-2xl font-bold leading-tight tracking-tight text-foreground lg:text-3xl">
          {title}
        </h2>
      )}

      <div className="flex flex-1 flex-col gap-6 lg:gap-8">
        {/* الوسيط — صورة/فيديو قابل للتغيير بعرض كامل وبارتفاع أقصى محسوب */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted lg:max-h-[28rem]">
          {hasVideo && media === "video" ? (
            <EmbedFrame url={url} embed={embed} />
          ) : (
            <ExploreThumb
              image={image}
              fallbackImage="/images/lesson-fallback.jpg"
              className="absolute inset-0 size-full object-cover"
              alt={title ?? "صورة"}
              fallback={
                <span className="flex size-full items-center justify-center rounded-xl bg-muted">
                  <ImageIcon className="size-10 text-muted-foreground" aria-hidden />
                </span>
              }
            />
          )}

          {/* تاب صغير للتبديل بين الصورة والفيديو أسفل الوسيط */}
          {hasVideo && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-border/60 bg-background/85 p-1 shadow-sm backdrop-blur">
              <button
                type="button"
                onClick={() => setMedia("image")}
                aria-pressed={media === "image"}
                className={`flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors ${
                  media === "image"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="size-3.5" aria-hidden />
                صورة
              </button>
              <button
                type="button"
                onClick={() => setMedia("video")}
                aria-pressed={media === "video"}
                className={`flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors ${
                  media === "video"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Play className="size-3.5" aria-hidden />
                فيديو
              </button>
            </div>
          )}
        </div>

        {/* النص — بعرض كامل */}
        <div className="flex flex-col gap-5">
          <RichLessonContent doc={doc ?? null} className="text-base leading-relaxed" />
        </div>
      </div>
    </article>
  );
}

function EmbedFrame({ url, embed }: { url?: string | null; embed?: string | null }) {
  if (embed) {
    return (
      <div className="absolute inset-0">
        <iframe
          src={embed}
          title="فيديو الدرس"
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <video className="absolute inset-0 size-full" controls preload="metadata" src={url ?? undefined} />
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
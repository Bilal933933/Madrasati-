"use client";

import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LabKind } from "../engine/types";
import { useMockLab } from "../hooks/use-mock-lab";
import type {
  SandboxBlockNode,
  SandboxDoc,
  SandboxInlineContent,
  SandboxInteractiveLabNode,
} from "../mock/paragraph";
import { loadScene } from "../scene/scenes";
import { ScenePanel } from "../scene/scene-panel";
import { LabSimPanel } from "./lab-sim-panel";

interface SandboxRichContentProps {
  doc: SandboxDoc;
  /** ارتفاع المشهد: مدمج (بعرض المحرك) أم مسرح */
  labSize: "compact" | "stage";
}

/**
 * عارض محتوى الفقرة — محاكاة `components/shared/rich-lesson-content.tsx`.
 *
 * الفرق الجوهري: النص محصور بعرض المحرك (42rem) بينما عقدة المختبر تخرج
 * للعرض الكامل (breakout) لأن مشهداً ثلاثي الأبعاد بعرض نص ضيق غير قابل للاستخدام.
 */
export function SandboxRichContent({ doc, labSize }: SandboxRichContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {doc.content.map((node, index) => (
        <RichBlock key={index} node={node} labSize={labSize} />
      ))}
    </div>
  );
}

function RichBlock({ node, labSize }: { node: SandboxBlockNode; labSize: "compact" | "stage" }) {
  switch (node.type) {
    case "interactive_lab":
      return <LabNode node={node} labSize={labSize} />;

    case "heading": {
      const Tag = node.attrs?.level === 2 ? "h2" : "h3";
      return (
        <Tag className="mx-auto w-full max-w-2xl font-heading text-lg font-bold leading-tight">
          <Inline content={node.content} />
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p className="mx-auto w-full max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <Inline content={node.content} />
        </p>
      );

    case "blockquote":
      return (
        <blockquote className="mx-auto w-full max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-relaxed">
          {node.content?.map((child, index) =>
            child.type === "paragraph" ? (
              <p key={index}>
                <Inline content={child.content} />
              </p>
            ) : null,
          )}
        </blockquote>
      );

    case "bulletList":
    case "orderedList": {
      const List = node.type === "bulletList" ? "ul" : "ol";
      return (
        <List
          className={cn(
            "mx-auto flex w-full max-w-2xl flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground",
            node.type === "bulletList" ? "list-disc ps-5" : "list-decimal ps-5",
          )}
        >
          {node.content?.map((item, index) => (
            <li key={index}>
              {item.content?.map((child, childIndex) =>
                child.type === "paragraph" ? (
                  <span key={childIndex}>
                    <Inline content={child.content} />
                  </span>
                ) : null,
              )}
            </li>
          ))}
        </List>
      );
    }

    default:
      return null;
  }
}

/* ------------------------------ عقدة المختبر ------------------------------ */

/** داخل النص: المختبر يأخذ العرض الكامل بلا أن يوسّع النص حوله */
function LabNode({ node, labSize }: { node: SandboxInteractiveLabNode; labSize: "compact" | "stage" }) {
  const { attrs } = node;

  if (attrs.labKind === "scene") {
    return <SceneNode sceneId={attrs.sceneId} caption={attrs.caption} labSize={labSize} />;
  }

  return <SimNode labKind={attrs.labKind} caption={attrs.caption} labSize={labSize} />;
}

function LabFigure({ caption, children }: { caption?: string | null; children: ReactNode }) {
  return (
    <figure className="my-1 flex w-full flex-col gap-2">
      {children}
      {caption ? (
        <figcaption className="mx-auto flex w-full max-w-2xl items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          <FlaskConical className="size-3 shrink-0 text-amber-500" aria-hidden />
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** مختبر فيزيائي من السجل (بندول/مسار/نابض) */
function SimNode({
  labKind,
  caption,
  labSize,
}: {
  labKind: LabKind;
  caption?: string | null;
  labSize: "compact" | "stage";
}) {
  const { lab, isLoading } = useMockLab(labKind);

  return (
    <LabFigure caption={caption}>
      <div className={labSize === "compact" ? "mx-auto w-full max-w-2xl" : "w-full"}>
        {isLoading || !lab ? (
          <div className="h-[26rem] animate-pulse rounded-2xl border border-border bg-muted/50" />
        ) : (
          <LabSimPanel lab={lab} size={labSize} />
        )}
      </div>
    </LabFigure>
  );
}

/** مشهد عام من بيانات JSON — يعمل لأي مادة، والتحقق يسبق العرض */
function SceneNode({
  sceneId,
  caption,
  labSize,
}: {
  sceneId: string;
  caption?: string | null;
  labSize: "compact" | "stage";
}) {
  const loaded = loadScene(sceneId);

  return (
    <LabFigure caption={caption}>
      <div className={labSize === "compact" ? "mx-auto w-full max-w-2xl" : "w-full"}>
        {loaded.ok ? (
          <ScenePanel manifest={loaded.entry.manifest} size={labSize} />
        ) : (
          <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs">
            <p className="mb-1 font-bold text-rose-700 dark:text-rose-300">تعذّر عرض المشهد</p>
            <ul className="list-disc space-y-0.5 ps-4 text-muted-foreground">
              {loaded.issues.slice(0, 4).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </LabFigure>
  );
}

/* ------------------------------ النص الداخلي ------------------------------ */

function Inline({ content }: { content?: SandboxInlineContent }) {
  if (!content?.length) return null;

  return (
    <>
      {content.map((node, index) => {
        const bold = node.marks?.includes("bold") ?? false;
        const italic = node.marks?.includes("italic") ?? false;

        return (
          <span
            key={index}
            className={cn(bold && "font-bold text-foreground", italic && "italic")}
          >
            {node.text}
          </span>
        );
      })}
    </>
  );
}

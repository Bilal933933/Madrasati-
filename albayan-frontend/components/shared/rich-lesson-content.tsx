import type { TiptapDoc, TiptapListNode } from "@/features/lesson-engine/engine/tiptap-types";

/**
 * يعرض مستند TipTap (JSON) كبطاقات درس تعليمية:
 * - paragraph → 📘 مفهوم اليوم
 * - bulletList/orderedList → ✏ مثال
 * - blockquote → 💡 تذكر
 * - heading → عناوين أقسام داخل الفقرة
 * React خالص بلا dangerouslySetInnerHTML — المحتوى نص آمن من الباك.
 */
export function RichLessonContent({ doc, className }: { doc: TiptapDoc | null; className?: string }) {
  const content = doc?.content ?? [];
  if (content.length === 0) {
    return <p className={className ?? ""}>لا يوجد محتوى في هذه الفقرة.</p>;
  }
  return (
    <RichBlockList className={className}>
      {content.map((node, index) => (
        <RichBlockRenderer key={index} node={node} />
      ))}
    </RichBlockList>
  );
}

function RichBlockList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-3 ${className ?? ""}`}>{children}</div>;
}

function RichBlockRenderer({ node }: { node: NonNullable<TiptapDoc["content"]>[number] }) {
  switch (node.type) {
    case "paragraph":
      return (
        <LessonCard tone="concept" label="مفهوم اليوم">
          <InlineContent content={node.content} />
        </LessonCard>
      );
    case "heading":
      return (
        <div aria-hidden className="mb-1 mt-3 first:mt-0">
          <OneLine text={textOf(node.content)} as="h3" className="text-lg font-bold" />
        </div>
      );
    case "bulletList":
    case "orderedList":
      return <ExampleCard node={node} />;
    case "blockquote":
      return (
        <LessonCard tone="note" label="تذكر">
          <InlineContent content={node.content} />
        </LessonCard>
      );
    case "hardBreak":
      return <div aria-hidden className="h-px" />;
    default:
      return null;
  }
}

function ExampleCard({ node }: { node: TiptapListNode }) {
  const ordered = node.type === "orderedList";
  return (
    <LessonCard tone="example" label={ordered ? "أمثلة مرقّمة" : "مثال"}>
      <ol className={`flex flex-col gap-2 ${ordered ? "list-decimal pr-5" : ""}`}>
        {node.content?.map((item, index) => {
          const itemText = textOf(item.content);
          return (
            <li key={index} className="flex items-start gap-2.5">
              {!ordered && <span aria-hidden className="mt-0.5 shrink-0 opacity-60">•</span>}
              <span>{itemText}</span>
            </li>
          );
        })}
      </ol>
    </LessonCard>
  );
}

type Tone = "concept" | "example" | "note";

const TONE_STYLES: Record<Tone, { frame: string; chip: string }> = {
  concept: {
    frame: "border-primary/20 bg-primary/[0.03]",
    chip: "bg-primary/10 text-primary",
  },
  example: {
    frame: "border-muted-foreground/20 bg-muted/40",
    chip: "bg-muted-foreground/10 text-muted-foreground",
  },
  note: {
    frame: "border-amber-500/30 bg-amber-500/[0.04]",
    chip: "bg-amber-500/15 text-amber-700",
  },
};

const TONE_LABELS: Record<Tone, string> = {
  concept: "📘",
  example: "✏",
  note: "💡",
};

function LessonCard({
  tone,
  label,
  children,
}: {
  tone: Tone;
  label: string;
  children: React.ReactNode;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <div className={`rounded-xl border px-4 py-3.5 ${styles.frame}`}>
      <header className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span aria-hidden className={styles.chip}>
          {TONE_LABELS[tone]}
        </span>
        <span>{label}</span>
      </header>
      <div className="text-[0.95rem] leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

function InlineContent({ content }: { content?: { type: string; text?: string; marks?: { type: string }[] }[] }) {
  if (!content) {
    return null;
  }
  return (
    <>
      {content.map((run, index) => {
        const marks = run.marks ?? [];
        let inner: React.ReactNode = run.text ?? "";
        if (marks.some((m) => m.type === "bold")) {
          inner = <strong className="font-semibold">{inner}</strong>;
        }
        if (marks.some((m) => m.type === "italic")) {
          inner = <em>{inner}</em>;
        }
        if (marks.some((m) => m.type === "strike")) {
          inner = <del>{inner}</del>;
        }
        return <span key={index}>{inner}</span>;
      })}
    </>
  );
}

function textOf(
  content?: { type: string; text?: string; content?: { type: string; text?: string }[] }[]
): string {
  if (!content) {
    return "";
  }
  return content
    .map((node) => (node.type === "text" ? (node.text ?? "") : textOf(node.content)))
    .join("");
}

function OneLine({ text, as, className }: { text: string; as?: keyof React.JSX.IntrinsicElements; className?: string }) {
  const Tag = as ?? "p";
  return <Tag className={className}>{text}</Tag>;
}
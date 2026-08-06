"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RichTextEditorProps = {
  value: string;
  onValueChange: (html: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

const HEADING_OPTIONS = [
  { value: "p", label: "فقرة" },
  { value: "h1", label: "عنوان كبير" },
  { value: "h2", label: "عنوان متوسط" },
  { value: "h3", label: "عنوان صغير" },
];

export function RichTextEditor({
  value,
  onValueChange,
  placeholder = "اكتب المحتوى هنا...",
  id,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: parseContent(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-editor-content focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onValueChange(JSON.stringify(editor.getJSON())),
  });

  if (!editor) {
    return <div className={`min-h-40 ${className ?? ""}`} />;
  }

  const headingLevel =
    editor.isActive("heading", { level: 1 })
      ? "h1"
      : editor.isActive("heading", { level: 2 })
        ? "h2"
        : editor.isActive("heading", { level: 3 })
          ? "h3"
          : "p";

  return (
    <div className={`rich-editor ${className ?? ""}`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-1.5">
        <Select
          value={headingLevel}
          onValueChange={(value) => {
            const el = editor.chain().focus();
            if (value === "p") el.setParagraph().run();
            else
              el.toggleHeading({
                level: Number(value.slice(1)) as 1 | 2 | 3,
              }).run();
          }}
        >
          <SelectTrigger
            aria-label="نمط النص"
            className="h-8 w-32"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <Toggle
          size="sm"
          aria-label="غامق"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="مائل"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="يتوسطه خط"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Minus />
        </Toggle>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <Toggle
          size="sm"
          aria-label="قائمة نقطية"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="قائمة مرقمة"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="اقتباس"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </Toggle>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="تراجع"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="إعادة"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
      </div>

      <EditorContent id={id} editor={editor} />
    </div>
  );
}

/**
 * يقبل المحرر محتوى JSON من الباك (سلسلة) مع fallback لمحتوى HTML قديم.
 * القيم غير الصالحة تُفسَّر كنص فارغ.
 */
function parseContent(value: string): JSONContent | string {
  if (!value) {
    return "";
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as JSONContent;
    }
  } catch {
    /* قيمة HTML قديمة أو نص عادي — يعامل كنص HTML. */
  }
  return value;
}

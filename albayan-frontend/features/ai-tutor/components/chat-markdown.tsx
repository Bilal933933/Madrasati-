"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { DiagramBlock } from "./diagram-block";

function isMermaidNode(node: unknown): boolean {
  const children = (node as { children?: Array<{ properties?: { className?: unknown } }> })
    ?.children;
  const className = children?.[0]?.properties?.className;
  return Array.isArray(className) && className.includes("language-mermaid");
}

function codeText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((child) => codeText(child as ReactNode)).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props
  ) {
    return codeText((children.props as { children?: ReactNode }).children);
  }
  return "";
}

/**
 * يعرض رد المعلم الذكي كنص Markdown منسّق:
 * - عناوين/قوائم/جداول (GFM)، معادلات LaTeX (KaTeX)، وأكواد ملوّنة.
 * - الرسائل الواردة من الطالب تبقى نصًّا عاديًّا ولا تمر عبر هذا المكوّن.
 */
export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div
      className="[&_.katex]:break-all [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-s-2 [&_blockquote]:border-primary/30 [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:text-sm [&_h4]:font-semibold [&_hr]:my-3 [&_hr]:border-border/60 [&_li]:my-1 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-1 [&_pre]:my-2 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:ps-5 [&_table]:my-3 [&_thead]:bg-muted"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          table: (props) => (
            <div className="my-3 overflow-x-auto">
              <table
                dir="rtl"
                className="w-full border-collapse border border-border text-sm"
                {...props}
              />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-border bg-muted px-3 py-1.5 text-start font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border border-border px-3 py-1.5" {...props} />
          ),
          pre: (props) => {
            if (isMermaidNode(props.node)) {
              return <>{props.children}</>;
            }
            return (
              <pre
                dir="ltr"
                className="overflow-x-auto rounded-lg bg-[#0d1117] p-3 text-xs leading-relaxed"
                {...props}
              />
            );
          },
          code: ({ className, children, ...props }) => {
            if (className?.includes("language-mermaid")) {
              return <DiagramBlock code={codeText(children)} />;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
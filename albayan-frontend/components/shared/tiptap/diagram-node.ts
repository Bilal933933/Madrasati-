import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DiagramNodeView } from "./diagram-node-view";

/**
 * عقدة مخطط Mermaid داخل مستند TipTap.
 * ذرة (atom) بلا أطفال تحمل كود المخطط في `attrs.content` نصيًا فقط.
 */
export const Diagram = Node.create({
  name: "diagram",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      content: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-diagram") ?? "",
        renderHTML: (attributes) => ({
          "data-diagram": attributes.content,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-diagram]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "diagram" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramNodeView);
  },
});
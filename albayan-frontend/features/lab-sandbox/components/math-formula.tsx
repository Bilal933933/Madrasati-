"use client";

import katex from "katex";
import { useMemo } from "react";
import "katex/dist/katex.min.css";

interface MathFormulaProps {
  latex: string;
  display?: boolean;
  className?: string;
}

/**
 * معادلة LaTeX عبر KaTeX. المدخلات نصوص ثابتة من بيانات المختبر (لا محتوى مستخدم)،
 * لذلك استخدام dangerouslySetInnerHTML آمن هنا.
 */
export function MathFormula({ latex, display = false, className }: MathFormulaProps) {
  const html = useMemo(
    () => katex.renderToString(latex, { throwOnError: false, displayMode: display }),
    [latex, display],
  );

  return (
    <span
      dir="ltr"
      className={className ?? "inline-block"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

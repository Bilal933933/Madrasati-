"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MermaidConfig } from "mermaid";

interface ThemeTokens {
  primary: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  card: string;
  background: string;
  muted: string;
  fontFamily: string;
}

function readThemeTokens(): ThemeTokens {
  const root = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) =>
    root.getPropertyValue(name).trim() || fallback;
  const fontFamily =
    getComputedStyle(document.body).fontFamily || "inherit";

  return {
    primary: pick("--primary", "#B08B66"),
    foreground: pick("--foreground", "#2D2926"),
    mutedForeground: pick("--muted-foreground", "#8A7B70"),
    border: pick("--border", "#E2D8CE"),
    card: pick("--card", "#FFFFFF"),
    background: pick("--background", "#F4EFEA"),
    muted: pick("--muted", "#EFE5D8"),
    fontFamily,
  };
}

/**
 * يُصلح صيغة عقد Mermaid الشائعة من النموذج: ["تسمية"] أو {"تسمية"} بدون معرّف
 * (كود غير صالح) بإضافة معرّف مولّد: N0["تسمية"] أو N0{"تسمية"}، مع إعادة
 * استخدام المعرّف نفسه للتسمية المتكررة حفاظًا على البنية.
 */
function repairMermaid(code: string): string {
  const ids = new Map<string, string>();
  let counter = 0;
  const passes: Array<{
    re: RegExp;
    build: (id: string, label: string) => string;
  }> = [
    {
      re: /(^|\s|>)\["([^"]*)"\]/g,
      build: (id, label) => `${id}["${label}"]`,
    },
    {
      re: /(^|\s|>)\{"([^"]*)"\}/g,
      build: (id, label) => `${id}{"${label}"}`,
    },
  ];

  let out = code;
  for (const { re, build } of passes) {
    const parts: string[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(out))) {
      const [full, prefix, label] = match;
      let id = ids.get(label);
      if (!id) {
        id = `N${counter++}`;
        ids.set(label, id);
      }
      parts.push(out.slice(last, match.index), `${prefix}${build(id, label)}`);
      last = match.index + full.length;
    }
    parts.push(out.slice(last));
    out = parts.join("");
  }
  return out;
}

function toThemeConfig(tokens: ThemeTokens): MermaidConfig {
  return {
    startOnLoad: false,
    theme: "base",
    fontFamily: tokens.fontFamily,
    themeVariables: {
      background: tokens.background,
      primaryColor: tokens.card,
      primaryTextColor: tokens.foreground,
      primaryBorderColor: tokens.primary,
      lineColor: tokens.border,
      secondaryColor: tokens.muted,
      tertiaryColor: tokens.background,
      mainBkg: tokens.card,
      nodeBorder: tokens.primary,
      nodeTextColor: tokens.foreground,
      clusterBkg: tokens.muted,
      clusterBorder: tokens.border,
      titleColor: tokens.foreground,
      textColor: tokens.foreground,
      labelColor: tokens.foreground,
      edgeLabelBackground: tokens.card,
      actorBkg: tokens.card,
      actorBorder: tokens.border,
      actorTextColor: tokens.foreground,
      signalColor: tokens.border,
      signalTextColor: tokens.foreground,
      activationBkgColor: tokens.muted,
      activationBorderColor: tokens.border,
      sequenceNumberColor: tokens.mutedForeground,
      altBackground: tokens.muted,
      noteBkgColor: tokens.muted,
      noteBorderColor: tokens.primary,
      noteTextColor: tokens.foreground,
      taskBorderColor: tokens.border,
      taskBkgColor: tokens.card,
    },
    flowchart: {
      curve: "basis",
      htmlLabels: true,
      padding: 12,
      wrappingWidth: 220,
      nodeSpacing: 42,
      rankSpacing: 55,
      useMaxWidth: true,
      diagramPadding: 12,
    },
    sequence: {
      actorMargin: 48,
      boxMargin: 8,
      messageMargin: 32,
      mirrorActors: false,
    },
  };
}

/**
 * يلوّن المخطط بعد الرندر بحقن قواعد CSS بنطاق معرّف المخطط وبأولوية
 * !important (فتتغلب على أنماط Mermaid المضمّنة): قرارات مميزة، مستطيلات
 * بلون البطاقة، حواف أوضح مع أسهم بلون الموقع.
 */
function styleDiagram(svg: SVGSVGElement, tokens: ThemeTokens) {
  const id = `#${svg.id}`;
  const css = [
    `${id} .node rect, ${id} .node circle, ${id} .node ellipse, ${id} .node polygon, ${id} .node path {`,
    `  fill: ${tokens.muted} !important;`,
    `  stroke: ${tokens.primary} !important;`,
    `}`,
    `${id} .node rect, ${id} .node ellipse {`,
    `  fill: ${tokens.card} !important;`,
    `  stroke-width: 1.5px !important;`,
    `}`,
    `${id} .node polygon {`,
    `  stroke-width: 2.2px !important;`,
    `}`,
    `${id} .edgePaths path, ${id} .flowchart-link {`,
    `  stroke: ${tokens.mutedForeground} !important;`,
    `  stroke-width: 2.2px !important;`,
    `}`,
    `${id} .marker {`,
    `  fill: ${tokens.mutedForeground} !important;`,
    `  stroke: ${tokens.mutedForeground} !important;`,
    `}`,
  ].join("\n");

  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = css;
  svg.appendChild(style);
}

/**
 * يعرض مخطط Mermaid بألوان وخطوط الموقع تلقائيًا (بما فيها الوضع الليلي).
 * عند عدم اكتمال كود المخطط أثناء البث، يعرض عنصر انتظار محايدًا
 * ويعيد المحاولة مع كل تحديث للدفق.
 */
export function DiagramBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(true);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const lastSeenCode = { value: code };
    const lastChangeAt = { at: Date.now() };

    const isBalanced = (src: string) => {
      let count = 0;
      for (const ch of src) if (ch === '"') count++;
      return count % 2 === 0;
    };

    const render = async () => {
      const container = containerRef.current;
      if (!container || cancelled) return;

      const trimmed = code.trim();
      if (!trimmed) {
        setPending(true);
        return;
      }

      const stable = Date.now() - lastChangeAt.at >= 2500;

      if (!isBalanced(trimmed)) {
        // أثناء البث كود الاقتباسات غير مكتمل: انتظار هادئ بدل وميض الخطأ.
        if (stable) {
          setFailed(true);
          setPending(false);
        } else {
          setPending(true);
        }
        return;
      }

      const renderId = `mmd-${id}-${Date.now()}`;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize(toThemeConfig(readThemeTokens()));

        const { svg } = await mermaid.render(renderId, repairMermaid(trimmed));

        if (!cancelled) {
          const tokens = readThemeTokens();
          container.innerHTML = svg;
          const svgEl = container.querySelector("svg");
          if (svgEl) styleDiagram(svgEl, tokens);
          setFailed(false);
          setPending(false);
        }
      } catch {
        document.getElementById(`d${renderId}`)?.remove();
        if (!cancelled) {
          // فشل حقيقي فقط بعد انتهاء البث واستقرار الكود.
          if (stable) {
            setFailed(true);
            setPending(false);
          } else {
            setPending(true);
          }
        }
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      const changed = lastSeenCode.value !== code;
      if (changed) {
        lastSeenCode.value = code;
        lastChangeAt.at = Date.now();
      }
      timer = setTimeout(() => {
        if (!cancelled) render();
      }, changed ? 450 : 150);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [code, id]);

  return (
    <div dir="ltr" className="my-3 overflow-x-auto">
      {failed && (
        <div dir="rtl" className="mb-2">
          <p className="mb-1 text-xs text-muted-foreground">
            تعذّر رسم المخطط تلقائيًا — الكود المصدر:
          </p>
          <pre
            dir="ltr"
            className="max-h-64 overflow-auto rounded-lg bg-[#0d1117] p-3 text-xs leading-relaxed text-gray-100"
          >
            {code}
          </pre>
        </div>
      )}
      <div
        ref={containerRef}
        className="[&_svg]:mx-auto [&_svg]:max-w-full [&_svg]:h-auto [&_g.node]:cursor-default"
      />
      {!failed && pending && (
        <div dir="rtl" role="status" className="text-sm text-muted-foreground">
          جارٍ تجهيز المخطط…
        </div>
      )}
    </div>
  );
}

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

function toThemeConfig(tokens: ThemeTokens): MermaidConfig {
  return {
    startOnLoad: false,
    theme: "base",
    fontFamily: tokens.fontFamily,
    themeVariables: {
      background: tokens.background,
      primaryColor: tokens.card,
      primaryTextColor: tokens.foreground,
      primaryBorderColor: tokens.border,
      lineColor: tokens.border,
      secondaryColor: tokens.muted,
      tertiaryColor: tokens.background,
      mainBkg: tokens.card,
      nodeBorder: tokens.border,
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
      noteBorderColor: tokens.border,
      noteTextColor: tokens.foreground,
      taskBorderColor: tokens.border,
      taskBkgColor: tokens.card,
    },
    flowchart: {
      curve: "basis",
      htmlLabels: true,
      padding: 8,
      wrappingWidth: 200,
      nodeSpacing: 32,
      rankSpacing: 40,
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
 * يعرض مخطط Mermaid بألوان وخطوط الموقع تلقائيًا (بما فيها الوضع الليلي).
 * عند عدم اكتمال كود المخطط أثناء البث، يعرض عنصر انتظار محايدًا
 * ويعيد المحاولة مع كل تحديث للدفق.
 */
export function DiagramBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const render = async () => {
      const container = containerRef.current;
      if (!container) return;

      const renderId = `mmd-${id}-${Date.now()}`;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize(toThemeConfig(readThemeTokens()));

        const { svg } = await mermaid.render(renderId, code);

        if (!cancelled) {
          container.innerHTML = svg;
          setFailed(false);
        }
      } catch {
        document.getElementById(`d${renderId}`)?.remove();
        if (!cancelled) {
          setFailed(true);
          container.innerHTML = "";
        }
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!cancelled) render();
      }, 120);
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
        <div
          dir="rtl"
          className="mb-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground"
        >
          جارٍ تجهيز الرسم التوضيحي…
        </div>
      )}
      <div
        ref={containerRef}
        className="[&_svg]:mx-auto [&_svg]:max-w-full [&_svg]:h-auto [&_g.node]:cursor-default"
      />
    </div>
  );
}

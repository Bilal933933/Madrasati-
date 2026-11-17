"use client";

import { Box, MousePointerClick, Pause, Play, RotateCcw, ScanEye, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import type { SceneCard, SceneManifest } from "./schema";
import type { SceneController } from "./scene-viewport";

/** Three.js يُحمَّل في المتصفح فقط — لا يلمس حزمة الخادم ولا SSR */
const SceneViewport = dynamic(() => import("./scene-viewport").then((mod) => mod.SceneViewport), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-slate-950 text-[11px] text-slate-400">
      يحمّل المشهد…
    </div>
  ),
});

interface ScenePanelProps {
  manifest: SceneManifest;
  size?: "compact" | "stage";
  className?: string;
}

/**
 * لوحة مشهد عام: بيانات JSON → مشهد ثلاثي الأبعاد.
 * تعمل لأي مادة؛ لا تعرف الفيزياء ولا الدرس.
 */
export function ScenePanel({ manifest, size = "stage", className }: ScenePanelProps) {
  const [running, setRunning] = useState(true);
  const [fps, setFps] = useState(0);
  const [card, setCard] = useState<SceneCard | null>(null);
  const [controller, setController] = useState<SceneController | null>(null);

  const handleCard = useCallback((next: SceneCard) => setCard(next), []);
  const handleFps = useCallback((next: number) => setFps(next), []);

  const clickableCount = manifest.objects.filter((object) => object.card).length;

  return (
    <section
      aria-label={`مشهد: ${manifest.title}`}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl shadow-slate-950/20",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[#0b1220]",
          size === "compact" ? "aspect-[16/10]" : "h-[clamp(18rem,44vh,30rem)]",
        )}
      >
        <SceneViewport
          manifest={manifest}
          running={running}
          onCard={handleCard}
          onFps={handleFps}
          onController={setController}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-slate-950/70 to-transparent p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
            <Box className="size-3 text-sky-400" aria-hidden />
            {manifest.title}
          </span>
          <span
            dir="ltr"
            className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-400 tabular-nums backdrop-blur"
          >
            {fps} FPS
          </span>
        </div>

        {card ? (
          <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-slate-950/85 p-3 text-slate-100 shadow-lg backdrop-blur">
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-xs font-bold">{card.title ?? "معلومة"}</p>
              <button
                type="button"
                onClick={() => setCard(null)}
                aria-label="إغلاق البطاقة"
                className="rounded-md p-0.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">{card.text}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-slate-900/70 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            aria-label={running ? "إيقاف الحركة" : "تشغيل الحركة"}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-100 transition-colors hover:bg-white/15"
          >
            {running ? <Pause className="size-3" aria-hidden /> : <Play className="size-3" aria-hidden />}
            {running ? "إيقاف" : "تشغيل"}
          </button>
          <button
            type="button"
            onClick={() => controller?.reset()}
            aria-label="إعادة المشهد"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[11px] font-bold text-slate-300 transition-colors hover:bg-white/10"
          >
            <RotateCcw className="size-3" aria-hidden />
            إعادة
          </button>
          <button
            type="button"
            onClick={() => controller?.resetView()}
            aria-label="إرجاع الكاميرا"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[11px] font-bold text-slate-300 transition-colors hover:bg-white/10"
          >
            <ScanEye className="size-3" aria-hidden />
            الكاميرا
          </button>
        </div>

        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <MousePointerClick className="size-3" aria-hidden />
          {clickableCount > 0
            ? `انقر ${clickableCount} عناصر موسومة لقراءة بطاقتها`
            : "اسحب للتدوير، وقرّب بعجلة الفأرة"}
        </p>
      </div>
    </section>
  );
}

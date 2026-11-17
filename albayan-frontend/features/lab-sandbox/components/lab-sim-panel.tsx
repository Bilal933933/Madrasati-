"use client";

import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toParamValues } from "../engine/params";
import type { LabDefinition, LabReadout } from "../engine/types";
import { EnergyMeters, LabChips } from "./energy-meters";
import { LabControls } from "./lab-controls";
import type { LabController } from "./lab-viewport";

/** Three.js يُحمَّل في المتصفح فقط — لا يلمس حزمة الخادم ولا SSR */
const LabViewport = dynamic(() => import("./lab-viewport").then((mod) => mod.LabViewport), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

interface LabSimPanelProps {
  lab: LabDefinition;
  /** ارتفاع المشهد: مدمج داخل الدرس أم مسرح كامل */
  size?: "compact" | "stage";
}

/**
 * لوحة المختبر التفاعلية: مشهد + عدّادات طاقة + منزلقات.
 * كل الحالة هنا محلية؛ لا شيء منها يخرج إلى الباك أو المتجر العام.
 */
export function LabSimPanel({ lab, size = "stage" }: LabSimPanelProps) {
  const initialValues = useMemo(() => toParamValues(lab.controls), [lab.controls]);
  const [values, setValues] = useState<Record<string, number>>(initialValues);
  const [running, setRunning] = useState(true);
  const [readout, setReadout] = useState<LabReadout | null>(null);
  const [fps, setFps] = useState(0);
  const [controller, setController] = useState<LabController | null>(null);

  const handleControl = useCallback((id: string, value: number) => {
    setValues((current) => ({ ...current, [id]: value }));
    controller?.setParam(id, value);
  }, [controller]);

  const handleReset = useCallback(() => {
    setValues(initialValues);
    for (const control of lab.controls) controller?.setParam(control.id, control.value);
    controller?.reset();
  }, [controller, initialValues, lab.controls]);

  return (
    <section
      aria-label={`مختبر ${lab.label}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl shadow-slate-950/20"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[#0b1220]",
          size === "compact" ? "aspect-[16/10]" : "h-[clamp(18rem,44vh,30rem)]",
        )}
      >
        <LabViewport
          lab={lab}
          running={running}
          onReadout={setReadout}
          onController={setController}
          onFps={setFps}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-slate-950/70 to-transparent p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
            <span
              className={cn(
                "size-1.5 rounded-full",
                running ? "animate-pulse bg-emerald-400" : "bg-slate-500",
              )}
              aria-hidden
            />
            {lab.label}
          </span>
          <span
            dir="ltr"
            className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-400 tabular-nums backdrop-blur"
          >
            {fps} FPS
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 bg-slate-950 px-3 py-2.5">
        <EnergyMeters readout={readout} />
        <LabChips readout={readout} />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-900/70 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ToolButton
              label={running ? "إيقاف مؤقت" : "تشغيل"}
              onClick={() => setRunning((value) => !value)}
              primary
            >
              {running ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
            </ToolButton>
            <ToolButton label="إعادة" onClick={handleReset}>
              <RotateCcw className="size-3.5" aria-hidden />
            </ToolButton>
            <ToolButton label="إرجاع الكاميرا" onClick={() => controller?.resetView()}>
              <Maximize2 className="size-3.5" aria-hidden />
            </ToolButton>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">الطاقة المتبادلة</span>
        </div>

        <LabControls controls={lab.controls} values={values} onChange={handleControl} />

        <p className="text-[11px] leading-relaxed text-slate-500">
          اسحب الجسم داخل المشهد لتغيير وضعه، وحرّك الفأرة مع الضغط لتدوير الكاميرا.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------ عناصر صغيرة ------------------------------ */

function ToolButton({
  label,
  onClick,
  primary = false,
  children,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg border text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400",
        primary
          ? "border-transparent bg-amber-500 text-slate-950 hover:bg-amber-400"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function SceneSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-[#0b1220]">
      <div className="flex flex-col items-center gap-2 text-[11px] font-semibold text-slate-500">
        <span className="size-6 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
        جارٍ تحميل المشهد…
      </div>
    </div>
  );
}

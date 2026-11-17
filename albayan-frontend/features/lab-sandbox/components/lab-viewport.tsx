"use client";

import { useEffect, useRef, useState } from "react";
import { createSim } from "../engine/sim-registry";
import { LabStage } from "../engine/stage";
import type { LabDefinition, LabReadout } from "../engine/types";

export interface LabController {
  setParam: (id: string, value: number) => void;
  reset: () => void;
  resetView: () => void;
}

interface LabViewportProps {
  lab: LabDefinition;
  running: boolean;
  onReadout: (readout: LabReadout) => void;
  onController: (controller: LabController | null) => void;
  onFps: (fps: number) => void;
}

/** حد أقصى ~15 مرة/ثانية لتحديث الواجهة — الرسم يبقى 60 إطاراً */
const READOUT_INTERVAL_MS = 66;

/**
 * حاوية Three.js: تنشئ المسرح والمحاكاة عند التركيب، وتحرّرهما عند الإزالة.
 * لا تُستورد إلا عبر next/dynamic (ssr: false) فلا تدخل حزمة الخادم.
 */
export function LabViewport({ lab, running, onReadout, onController, onFps }: LabViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<LabStage | null>(null);
  const runningRef = useRef(running);
  const callbacksRef = useRef({ onReadout, onController, onFps });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callbacksRef.current = { onReadout, onController, onFps };
  }, [onReadout, onController, onFps]);

  useEffect(() => {
    runningRef.current = running;
    stageRef.current?.setRunning(running);
  }, [running]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let stage: LabStage;
    try {
      stage = new LabStage(host);
    } catch {
      // خارج جسم الأثر مباشرةً: تحديث الحالة في مهمة لاحقة يمنع الرسم المتسلسل
      queueMicrotask(() => setError("تعذّر تشغيل WebGL في هذا المتصفح. جرّب متصفحاً آخر أو أخبر المعلّم."));
      return;
    }

    const sim = createSim(lab.id, stage, lab.controls);
    stage.setSim(sim);
    stage.setRunning(runningRef.current);

    let lastReadout = 0;
    stage.onFrame = () => {
      const now = performance.now();
      if (now - lastReadout < READOUT_INTERVAL_MS) return;
      lastReadout = now;
      callbacksRef.current.onReadout(sim.readout());
    };
    stage.onFps = (fps) => callbacksRef.current.onFps(fps);

    callbacksRef.current.onController({
      setParam: (id, value) => sim.setParam(id, value),
      reset: () => sim.reset(),
      resetView: () => stage.resetView(),
    });

    stageRef.current = stage;

    return () => {
      callbacksRef.current.onController(null);
      stage.dispose();
      stageRef.current = null;
    };
  }, [lab.id, lab.controls]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={hostRef}
        className="h-full w-full [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      />
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-slate-950/90 p-6 text-center text-xs leading-relaxed text-slate-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}

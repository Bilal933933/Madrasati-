"use client";

import { useEffect, useRef, useState } from "react";
import { LabStage } from "../engine/stage";
import type { SceneCard, SceneManifest } from "./schema";
import { ScenePlayer } from "./scene-player";

export interface SceneController {
  resetView: () => void;
  reset: () => void;
}

interface SceneViewportProps {
  manifest: SceneManifest;
  running: boolean;
  onCard: (card: SceneCard) => void;
  onFps: (fps: number) => void;
  onController: (controller: SceneController | null) => void;
}

/** أقل من هذا المقدار (بكسل) يُعدّ نقرة لا سحباً */
const CLICK_SLOP = 6;

/**
 * حاوية مشهد Three.js — تُستورد فقط عبر next/dynamic (ssr: false).
 * تعيد استخدام `LabStage` كما هي: الكاميرا والإضاءة والتحكم والحلقة والتحرير.
 */
export function SceneViewport({ manifest, running, onCard, onFps, onController }: SceneViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<LabStage | null>(null);
  const runningRef = useRef(running);
  const callbacksRef = useRef({ onCard, onFps, onController });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callbacksRef.current = { onCard, onFps, onController };
  }, [onCard, onFps, onController]);

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
      queueMicrotask(() => setError("تعذّر تشغيل WebGL في هذا المتصفح. جرّب متصفحاً آخر أو أخبر المعلّم."));
      return;
    }

    if (manifest.environment.background) {
      stage.setBackground(manifest.environment.background);
    }

    const player = new ScenePlayer(manifest);
    stage.setSim(player);
    stage.setRunning(runningRef.current);
    stage.onFps = (fps) => callbacksRef.current.onFps(fps);

    const canvas = stage.canvas;
    const clickable = player.getClickable();
    const cards = new Map(
      manifest.objects
        .filter((object) => object.card)
        .map((object) => [object.id, object.card] as const),
    );

    const pick = (event: PointerEvent): string | null => {
      for (const object of clickable) {
        if (stage.hits(event, object) && object.name && cards.has(object.name)) {
          return object.name;
        }
      }
      return null;
    };

    let downX = 0;
    let downY = 0;

    const handleDown = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };

    const handleUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > CLICK_SLOP) return;
      const id = pick(event);
      const card = id ? cards.get(id) : null;
      if (card) callbacksRef.current.onCard(card);
    };

    const handleMove = (event: PointerEvent) => {
      canvas.style.cursor = pick(event) ? "pointer" : "grab";
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointermove", handleMove);

    callbacksRef.current.onController({
      resetView: () => stage.resetView(),
      reset: () => player.reset(),
    });

    stageRef.current = stage;

    return () => {
      callbacksRef.current.onController(null);
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointermove", handleMove);
      stage.dispose();
      stageRef.current = null;
    };
  }, [manifest]);

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

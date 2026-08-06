"use client";

import { useEffect, useState } from "react";

/**
 * يقدّم المراحل تلقائيًا في حلقة زمنية هادئة، مع إمكانية الإيقاف اليدوي.
 * يعيد { step, next, prev, reset, stop, start, paused }.
 */
export function useAutoStep(total: number, interval = 4000) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setStep((s) => (s + 1) % total);
    }, interval);
    return () => clearInterval(id);
  }, [total, interval, paused]);

  const next = () => setStep((s) => (s + 1) % total);
  const prev = () => setStep((s) => (s - 1 + total) % total);
  const reset = () => setStep(0);
  const stop = () => setPaused(true);
  const start = () => setPaused(false);

  return { step, next, prev, reset, stop, start, paused };
}

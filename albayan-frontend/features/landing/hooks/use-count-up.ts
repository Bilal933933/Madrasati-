"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "./use-in-view";

/**
 * يعدّ من start إلى end عند دخول العنصر الشاشة.
 * يعيد { ref, value } حيث ref يُوضع على العنصر المراقب.
 */
export function useCountUp(end: number, start = 0, duration = 1200) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [value, setValue] = useState(start);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, end, start, duration]);

  return { ref, value };
}

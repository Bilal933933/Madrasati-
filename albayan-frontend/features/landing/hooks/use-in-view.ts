"use client";

import { useEffect, useRef, useState } from "react";

/**
 * يرجع ref للعنصر و inView: يتحول إلى true عند دخول العنصر الشاشة
 * و false عند خروجه، فيُعاد تشغيل الأنيميشن في كل مرة يُمرَّر عليها.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

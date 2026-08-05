"use client";

import { useEffect, useRef, useState } from "react";

/**
 * يرجع ref للعنصر و inView: يتحول إلى true عند دخول العنصر الشاشة،
 * ويبقى true بعد ذلك (لا يتراجع).
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

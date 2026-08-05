"use client";

import { useEffect, useState } from "react";

/**
 * نسبة تقدم تمرير الصفحة كلها (0 → 1).
 * تُستخدم لتمديد مسار الرحلة الخلفي تدريجيًا.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress(Math.min(1, Math.max(0, window.scrollY / docHeight)));
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return progress;
}

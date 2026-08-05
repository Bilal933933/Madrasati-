"use client";

import type { ReactNode } from "react";
import { useInView } from "../hooks/use-in-view";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** تأخير الظهور بالمللي ثانية — يستخدم للظهور التدريجي (Stagger). */
  delay?: number;
}

/**
 * غلاف يُظهر محتواه عند دخوله الشاشة بحركة هادئة.
 * يُستخدم للبطاقات لتظهر تدريجيًا (Stagger) مع التمرير.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

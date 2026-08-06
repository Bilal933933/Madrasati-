"use client";

import type { ReactNode } from "react";
import { useInView } from "../hooks/use-in-view";
import { cn } from "@/lib/utils";

interface StaggerGroupProps {
  children: ReactNode[];
  className?: string;
  /** الفاصل الزمني بين ظهور كل عنصر بالمللي ثانية. */
  step?: number;
  /** تأخير بداية الظهور بالمللي ثانية. */
  delay?: number;
}

/**
 * يعرض مجموعة عناصر تظهر واحدًا تلو الآخر (Stagger) عند دخولها الشاشة.
 * يُستخدم للبطاقات والنتائج والإنجازات لتعطي إحساسًا متدرجًا.
 */
export function StaggerGroup({ children, className, step = 100, delay = 0 }: StaggerGroupProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          style={{ transitionDelay: `${delay + index * step}ms` }}
          className={cn(
            "transition-all duration-700 ease-out",
            inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

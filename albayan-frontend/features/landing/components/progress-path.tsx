"use client";

import { useScrollProgress } from "../hooks/use-scroll-progress";
import { cn } from "@/lib/utils";

export interface JourneyStation {
  icon: string;
  label: string;
}

interface ProgressPathProps {
  stations: JourneyStation[];
  className?: string;
}

/**
 * مسار رحلة خلفي رأسي على جانب الصفحة يمتلئ تدريجيًا مع التمرير.
 * كل محطة تُمثّل قسمًا من الصفحة، وتضيء عندما يصل إليها التمرير.
 * مخفي على الشاشات الصغيرة.
 */
export function ProgressPath({ stations, className }: ProgressPathProps) {
  const progress = useScrollProgress();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-y-0 start-6 z-30 hidden flex-col items-center lg:flex",
        className,
      )}
    >
      {/* المسار الخلفي الكامل */}
      <div className="absolute inset-y-20 w-px bg-border/70" />
      {/* الجزء الممتلئ */}
      <div
        className="absolute inset-y-20 w-px bg-primary/70"
        style={{
          height: `calc((100% - 10rem) * ${progress})`,
        }}
      />

      {/* المحطات */}
      <div className="relative flex h-full flex-col items-center justify-between py-20">
        {stations.map((station, index) => {
          const threshold = (index + 0.5) / stations.length;
          const active = progress >= threshold;
          return (
            <div key={station.label} className="relative flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border bg-background text-sm transition-all duration-500",
                  active
                    ? "border-primary text-primary shadow-md shadow-primary/20"
                    : "border-border text-muted-foreground",
                )}
              >
                {station.icon}
              </span>
              <span
                className={cn(
                  "text-[0.6rem] font-medium transition-colors duration-500",
                  active ? "text-primary" : "text-muted-foreground/70",
                )}
              >
                {station.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

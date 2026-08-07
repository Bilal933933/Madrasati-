import { cn } from "@/lib/utils";

/**
 * شريط تقدم بلون الثيم (primary) — خلفية من muted.
 */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

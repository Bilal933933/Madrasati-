import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  total: number;
  current: number;
  done: boolean[];
}

/**
 * مؤشر تقدم الأسئلة — نقاط متتابعة: مكتملة خضراء، الحالية بارزة،
 * الباقي محايد. يُبنى من `done` (الأسئلة المنجزة فعلاً) لا من توقعات.
 */
export function ProgressIndicator({ total, current, done }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="group" aria-label="تقدم الأسئلة">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full transition-colors",
            done[index] ? "bg-emerald-500" : index === current ? "bg-primary" : "bg-muted-foreground/25"
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
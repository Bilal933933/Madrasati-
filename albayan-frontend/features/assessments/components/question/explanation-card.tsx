import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationCardProps {
  title?: string;
  children: React.ReactNode;
  tone?: "success" | "neutral";
  className?: string;
}

const TONE_STYLES: Record<NonNullable<ExplanationCardProps["tone"]>, string> = {
  success: "border-emerald-500/30 bg-emerald-500/5",
  neutral: "border-border bg-muted/40",
};

/**
 * بطاقة الشرح — تُعرض بعد الإجابة لتعلّل الصواب.
 */
export function ExplanationCard({
  title = "لماذا هذا هو الصواب؟",
  children,
  tone = "neutral",
  className,
}: ExplanationCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        TONE_STYLES[tone],
        className
      )}
    >
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
        <BookOpen className="size-4" aria-hidden />
        {title}
      </p>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

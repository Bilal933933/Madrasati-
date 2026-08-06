import { CheckCircle2, Info, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackBubbleProps {
  tone: "success" | "neutral" | "info";
  children: React.ReactNode;
  className?: string;
}

export type { FeedbackBubbleProps };

const TONE_STYLES: Record<FeedbackBubbleProps["tone"], string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
  neutral: "border-border bg-muted/50 text-foreground",
  info: "border-primary/30 bg-primary/10 text-foreground",
};

const TONE_ICONS: Record<FeedbackBubbleProps["tone"], LucideIcon> = {
  success: CheckCircle2,
  neutral: Info,
  info: Lightbulb,
};

/**
 * فقاعة التغذية الراجعة («أحسنت» / «لا بأس») — رسالة قصيرة غير حاكمة.
 */
export function FeedbackBubble({ tone, children, className }: FeedbackBubbleProps) {
  const Icon = TONE_ICONS[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        TONE_STYLES[tone],
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

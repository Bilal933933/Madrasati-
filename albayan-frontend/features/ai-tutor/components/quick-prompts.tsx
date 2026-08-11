"use client";

import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUICK_PROMPTS } from "../constants/prompts";

/**
 * اقتراحات الأسئلة — تظهر في شاشة الترحيب قبل بدء المحادثة،
 * ينقر الطالب سؤالًا فيُرسل مباشرة دون كتابة.
 */
export function QuickPrompts({
  onAsk,
  disabled = false,
}: {
  onAsk: (question: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
        جرّب أن تسأل:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(prompt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3.5 py-2 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <SendHorizontal className="size-3.5 text-primary/70" aria-hidden />
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
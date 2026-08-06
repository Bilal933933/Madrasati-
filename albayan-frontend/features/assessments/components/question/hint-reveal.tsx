import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HintRevealProps {
  hint: string;
  open: boolean;
  onToggle: () => void;
}

/**
 * «لمحة» اختيارية — مفتوحة قابلة للطي، يقرر الطالب متى يطلعها.
 */
export function HintReveal({ hint, open, onToggle }: HintRevealProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-expanded={open}
      >
        لمحة
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <p className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground duration-200">
          {hint}
        </p>
      )}
    </div>
  );
}
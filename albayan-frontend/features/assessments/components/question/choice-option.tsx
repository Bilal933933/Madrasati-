import { cn } from "@/lib/utils";

interface ChoiceOptionProps {
  option: {
    id: number;
    content: string;
  };
  selected: boolean;
  state?: "idle" | "correct" | "wrong";
  disabled?: boolean;
  onSelect: (optionId: number) => void;
}

export type { ChoiceOptionProps };

/**
 * خيار اختياري في سؤال من متعدد (MCQ) — غير محكم: يستقبل الحالة
 * ويعيد الحدث. الحالة "correct"/"wrong" تُستعمل فقط بعد التغذية الراجعة.
 */
export function ChoiceOption({
  option,
  selected,
  state = "idle",
  disabled = false,
  onSelect,
}: ChoiceOptionProps) {
  const isRevealed = state !== "idle";

  return (
    <button
      type="button"
      disabled={disabled || isRevealed}
      onClick={() => onSelect(option.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background hover:bg-muted/60",
        isRevealed && state === "correct" &&
          "border-emerald-500/50 bg-emerald-500/10 text-foreground",
        isRevealed && state === "wrong" &&
          "border-destructive/50 bg-destructive/10 text-foreground",
        isRevealed && !selected && state === "correct" && "opacity-60",
        disabled && !isRevealed && "cursor-not-allowed opacity-50"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
        aria-hidden
      >
        {isRevealed ? (state === "correct" ? "✓" : state === "wrong" ? "✕" : "") : ""}
      </span>
      <span>{option.content}</span>
    </button>
  );
}

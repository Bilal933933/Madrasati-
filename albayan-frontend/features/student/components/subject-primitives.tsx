"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillButtonVariants = cva(
  "inline-flex w-full items-center justify-center rounded-full border text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      tone: {
        primary: "border-success/25 bg-success/10 text-success hover:bg-success/15",
        secondary: "border-border bg-secondary text-secondary-foreground hover:bg-accent",
        info: "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
        warning: "border-border bg-accent text-accent-foreground hover:bg-accent/80",
        hero: "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
      },
      size: {
        default: "",
        hero: "min-h-16 rounded-2xl px-6 text-base",
        bar: "h-10 rounded-[10px] px-6 text-sm",
      },
    },
    defaultVariants: { tone: "secondary", size: "default" },
  },
);

type PillButtonProps = VariantProps<typeof pillButtonVariants> & {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

/** زر حبة — روابط البطاقة بنفس السلوك، مع مقاس بطل للإجراء الرئيسي. */
export function PillButton({ href, children, ariaLabel, disabled, tone, size, className }: PillButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={disabled ? (event) => event.preventDefault() : undefined}
      className={cn(pillButtonVariants({ tone, size }), disabled && "pointer-events-none", className)}
      style={size === "default" ? { minHeight: "var(--subject-action-min-h)" } : undefined}
    >
      {children}
    </Link>
  );
}

/** زر شبحي بحدود — للإجراءات الثانوية في بطاقة المادة. */
export function GhostButton({
  href,
  children,
  ariaLabel,
  disabled,
  className,
}: {
  href: string;
  children: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={disabled ? (event) => event.preventDefault() : undefined}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-border bg-transparent px-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** مربع أيقونة 48px بخلفية نيلية فاتحة من التوكنز. */
export function IconBox({ children, label }: { children: ReactNode; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      style={{ width: "var(--subject-icon-size)", height: "var(--subject-icon-size)" }}
    >
      {children}
    </span>
  );
}

/** عنوان قسم بلوحة التفاصيل مع فاصل سفلي. */
export function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 border-b border-border/60 pb-3">
      <h3 className="text-base font-bold text-foreground">{children}</h3>
      <span className="text-primary" aria-hidden>
        {icon}
      </span>
    </div>
  );
}

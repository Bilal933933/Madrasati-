import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  /** مدة دورة الطفو بالثواني. */
  duration?: number;
  /** تأخير بدء الطفو بالثواني (لتفاوت البطاقات). */
  delay?: number;
}

/**
 * بطاقة زخرفية عائمة بنبض خفيف (Float) — تُستخدم للعناصر الخلفية
 * لإحساس "المنصة حيّة" دون تشتيت.
 */
export function FloatingCard({ children, className, duration = 6, delay = 0 }: FloatingCardProps) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

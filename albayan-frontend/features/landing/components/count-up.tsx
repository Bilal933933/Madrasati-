"use client";

import { useCountUp } from "../hooks/use-count-up";

interface CountUpProps {
  /** القيمة النهائية (قبل). */
  end: number;
  /** القيمة الابتدائية (بعد). */
  start?: number;
  /** مدة العدّ بالمللي ثانية. */
  duration?: number;
  /** نص يسبق الرقم. */
  prefix?: string;
  /** نص يلحق بالرقم. */
  suffix?: string;
  className?: string;
}

/**
 * يعرض رقمًا يعدّ تصاعديًا عند ظهوره على الشاشة.
 * مثال: <CountUp end={90} suffix="%" /> يعدّ من 0 إلى 90%.
 */
export function CountUp({ end, start = 0, duration, prefix, suffix, className }: CountUpProps) {
  const { ref, value } = useCountUp(end, start, duration);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

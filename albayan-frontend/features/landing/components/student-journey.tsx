"use client";

import {
  BookOpen,
  Hand,
  Library,
  PartyPopper,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { useInView } from "../hooks/use-in-view";
import { cn } from "@/lib/utils";

const JOURNEY_STEPS = [
  { icon: Hand, label: "دخل لأول مرة", note: "تجربة أول درس دون تسجيل" },
  { icon: Target, label: "جرّب الدرس", note: "عرف مستواه بتقييم قبلي" },
  { icon: BookOpen, label: "تعلّم", note: "فقرة فقرة بشرح مبسّط" },
  { icon: RefreshCcw, label: "راجع", note: "عندما لا يفهم — نعيد معه بهدوء" },
  { icon: Sparkles, label: "أتقن", note: "التقييم النهائي يثبت الفهم" },
  { icon: Library, label: "أنهى الوحدة", note: "الدروس اكتملت 5/5" },
  { icon: PartyPopper, label: "احتفل", note: "رأى تحسّنه بنفسه" },
];

/**
 * قسم "رحلة طالب في دقيقتين": Timeline رأسي يُظهر مسار الطالب كاملًا
 * من أول دخول إلى الاحتفال — ليرى الزائر نفسه داخل المنصة.
 */
export function StudentJourney() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          رحلة طالب في دقيقتين
        </h2>
        <p className="mt-3 text-muted-foreground">
          هكذا ستكون أيامك في مدرستي — خطوة تلو أخرى.
        </p>
      </div>

      <div ref={ref} className="relative mt-12">
        {/* الخط الرأسي */}
        <div className="absolute inset-y-0 start-[1.35rem] w-px bg-border sm:start-7" />
        <div
          className="absolute start-[1.35rem] w-px bg-primary transition-all duration-1000 sm:start-7"
          style={{ height: inView ? "100%" : "0%" }}
        />

        <div className="flex flex-col gap-8">
          {JOURNEY_STEPS.map((step, index) => (
            <div key={step.label} className="relative flex items-start gap-4 sm:gap-6">
              <span
                className={cn(
                  "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-500 sm:size-14",
                  inView
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground",
                )}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {(() => {
                  const Icon = step.icon;
                  return <Icon className="size-5 sm:size-6" aria-hidden />;
                })()}
              </span>
              <div
                className={cn(
                  "rounded-2xl border bg-card px-5 py-4 transition-all duration-700",
                  inView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0",
                )}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <p className="font-bold">
                  <span className="me-2 text-xs font-bold text-primary">
                    {index + 1}.
                  </span>
                  {step.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{step.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

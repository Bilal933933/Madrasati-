"use client";

import { BookOpen, Check, ChevronDown, HelpCircle, RefreshCcw, ThumbsUp, X } from "lucide-react";
import { useInView } from "../hooks/use-in-view";
import { cn } from "@/lib/utils";

/**
 * قلب هوية المنصة: قصة متحركة تبين أن كل فقرة تُقاس فورًا.
 * تظهر العناصر تباعًا عند دخول الشاشة، مع جملة الفرق بين المنصات
 * ومدرستي، ومسار "نعم ← التالي" / "ليس بعد ← راجع الفقرة".
 */
export function HowWeVerify() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  const nodeClass = (index: number) =>
    cn(
      "flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-500",
      inView && index < 3
        ? "translate-y-0 border-primary bg-primary/10 text-primary opacity-100"
        : "translate-y-4 border-border bg-background opacity-40",
    );

  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <div ref={ref} className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          كيف تعرف أنك فهمت فعلًا؟
        </h2>
        <p className="mt-3 text-muted-foreground">
          في معظم المنصات ينتهي الدرس عندما ينتهي الفيديو. في مدرستي يبدأ
          التعلم الحقيقي بعد الشرح.
        </p>
      </div>

      <div
        className={cn(
          "mx-auto mt-12 flex max-w-2xl flex-col items-center gap-2 transition-all duration-1000",
          inView ? "opacity-100" : "opacity-0",
        )}
      >
        {/* العقدة 1 */}
        <div className={nodeClass(0)}>
          <BookOpen className="size-4" />
          تقرأ الفقرة
        </div>
        <ChevronDown className={cn("size-4 transition-all duration-500", inView ? "text-primary" : "text-muted-foreground")} />
        {/* العقدة 2 */}
        <div className={nodeClass(1)}>
          <HelpCircle className="size-4" />
          سؤال صغير
        </div>
        <ChevronDown className={cn("size-4 transition-all duration-500", inView ? "text-primary" : "text-muted-foreground")} />
        {/* العقدة 3: قرار */}
        <div className={nodeClass(2)}>
          <Check className="size-4" />
          فهمت؟
        </div>

        {/* الفرعان */}
        <div
          className={cn(
            "mt-4 grid w-full gap-3 transition-all duration-700 sm:grid-cols-2",
            inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ThumbsUp className="size-4" />
            </span>
            <p className="font-semibold text-primary">نعم</p>
            <p className="text-sm text-muted-foreground">ممتاز — انتقل إلى الفقرة التالية</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCcw className="size-4" />
            </span>
            <p className="font-semibold text-destructive">ليس بعد</p>
            <p className="text-sm text-muted-foreground">نراجع الفقرة معًا، بلا خجل</p>
          </div>
        </div>

        {/* شريط الرسالة */}
        <div
          className={cn(
            "mt-6 flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm text-muted-foreground transition-all duration-700",
            inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
          style={{ transitionDelay: "600ms" }}
        >
          <X className="size-4 text-destructive" />
          لا وجود لـ&laquo;أخطأت&raquo; — فقط &laquo;راجع ثم تقدم&raquo;.
        </div>
      </div>
    </section>
  );
}

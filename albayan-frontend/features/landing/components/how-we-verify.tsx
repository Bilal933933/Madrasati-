"use client";

import { BookOpen, Check, ChevronDown, HelpCircle, RefreshCcw, ThumbsUp, X } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

/**
 * قلب هوية المنصة: قصة تبين أن كل فقرة تُقاس فورًا.
 * تظهر العناصر بوضوح وثبات مع تأثير التمرير السلس ScrollReveal،
 * مع جملة الفرق بين المنصات ومدرستي، ومسار "نعم ← التالي" / "ليس بعد ← راجع الفقرة".
 */
export function HowWeVerify() {
  const nodeClass =
    "flex items-center justify-center gap-2 rounded-2xl border border-primary bg-primary/10 px-5 py-3 text-sm font-semibold text-primary opacity-100";

  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          كيف تعرف أنك فهمت فعلًا؟
        </h2>
        <p className="mt-3 text-muted-foreground">
          في معظم المنصات ينتهي الدرس عندما ينتهي الفيديو. في مدرستي يبدأ
          التعلم الحقيقي بعد الشرح.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={150} className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-2">
        {/* العقدة 1 */}
        <div className={nodeClass}>
          <BookOpen className="size-4" />
          تقرأ الفقرة
        </div>
        <ChevronDown className="size-4 text-primary" />
        {/* العقدة 2 */}
        <div className={nodeClass}>
          <HelpCircle className="size-4" />
          سؤال صغير
        </div>
        <ChevronDown className="size-4 text-primary" />
        {/* العقدة 3: قرار */}
        <div className={nodeClass}>
          <Check className="size-4" />
          فهمت؟
        </div>

        {/* الفرعان */}
        <div className="mt-4 grid w-full gap-3 sm:grid-cols-2">
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
        <div className="mt-6 flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm text-muted-foreground">
          <X className="size-4 text-destructive" />
          لا وجود لـ&laquo;أخطأت&raquo; — فقط &laquo;راجع ثم تقدم&raquo;.
        </div>
      </ScrollReveal>
    </section>
  );
}

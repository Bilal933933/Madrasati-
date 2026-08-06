"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "لماذا لا أستطيع الانتقال إلى الفقرة التالية؟",
    answer:
      "لأننا لا نتركك تمضي وأنت تحمل شكًا. بعد كل فقرة نتأكد أنك فهمتها، حتى لا تتراكم الفجوات وتبني فهمك على أساس سليم.",
  },
  {
    question: "لماذا يوجد تقييم بعد كل فقرة؟",
    answer:
      "التقييم ليس امتحانًا — بل بوصلة. سؤال واحد قصير يكشف إن كنت جاهزًا للمتابعة، أو نحتاج مراجعة سريعة معًا.",
  },
  {
    question: "هل الفيديو إجباري؟",
    answer:
      "لا. الفيديو مراجعة سريعة اختيارية — قلب التجربة هو الفقرات والتقييمات بعد كل خطوة.",
  },
  {
    question: "هل أستطيع إعادة الدرس؟",
    answer:
      "نعم، دائمًا. إعادة الدرس ليست عيبًا بل جزء من الرحلة — فالمقارنة دائمًا مع نفسك، لا مع غيرك.",
  },
  {
    question: "هل أستطيع التصفح قبل التسجيل؟",
    answer:
      "نعم، كل المواد والوحدات والدروس متاحة للاستعراض، وتجربة أول درس مجانية. فقط حفظ نتائجك ومتابعة تقدمك يحتاجان حسابًا.",
  },
];

/**
 * قسم "الأسئلة الشائعة": Accordion بأسلوب إنساني — عند فتح سؤال
 * يظهر أيقونة متحركة وتنكشف الإجابة بانسياب.
 */
export function Faq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
      <ScrollReveal className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">أسئلة شائعة</h2>
        <p className="mt-3 text-muted-foreground">كل شيء واضح قبل أن تبدأ.</p>
      </ScrollReveal>

      <div className="space-y-3">
        {FAQS.map((faq, index) => (
          <ScrollReveal key={faq.question} delay={index * 60}>
            <Collapsible>
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4 text-start transition-colors hover:border-primary/40">
                <span className="flex items-center gap-2.5 font-semibold">
                  <HelpCircle className="size-4 shrink-0 text-primary" />
                  {faq.question}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-open:rotate-180 group-data-open:text-primary" />
              </CollapsibleTrigger>
              <CollapsibleContent
                className={cn(
                  "overflow-hidden data-closed:animate-out data-closed:fade-out data-closed:slide-out-to-top-1 data-open:animate-in data-open:fade-in data-open:slide-in-from-top-1",
                  "rounded-b-2xl border-x border-b border-t-0 bg-card/50 px-5 pb-4 pt-1",
                )}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

import { Quote } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const TESTIMONIALS = [
  {
    name: "أحمد، الصف السادس",
    text: "كنت أحفظ الدرس وأنساه. الآن أعرف أين أخطئ قبل الامتحان.",
  },
  {
    name: "ولية أمر سارة",
    text: "ابنتي كانت تخلط بين المبتدأ والخبر. بعد ثلاثة دروس صارت تشرحها لي أنا.",
  },
  {
    name: "أ. خالد، معلم",
    text: "في الفصل أعرف من فهم ومن لم يفهم. هنا رأيت ذلك لحظة بلحظة لكل طالب.",
  },
  {
    name: "منى، الصف الخامس",
    text: "كنت أقرأ الصفحة كاملة وأغلقها بلا تركيز. السؤال بعد كل فقرة غيّر كل شيء.",
  },
  {
    name: "ولية أمر محمد",
    text: "ابني كان يقول «ذاكرت» وأكتشف أنه لم يفهم. الآن أرى النتيجة الحقيقية في الإشعارات.",
  },
];

/**
 * قسم "آراء الطلاب": شريط بطاقات يتحرك ببطء (Marquee) يحكي قصصًا
 * حقيقية (مشكلة → حل) وليس مجرد مدح — لأن القصة تُذكر أكثر من المدح.
 */
export function Testimonials() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="overflow-hidden py-20">
      <ScrollReveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ماذا تغيّر عندهم؟
        </h2>
        <p className="mt-3 text-muted-foreground">قصص حقيقية من داخل مدرستي.</p>
      </ScrollReveal>

      <div
        className="relative mt-12 flex w-max animate-[marquee_40s_linear_infinite] gap-4"
        style={{ direction: "rtl" }}
      >
        {doubled.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="w-80 shrink-0 rounded-3xl border bg-card p-6 shadow-sm"
          >
            <Quote className="size-6 text-primary/30" />
            <p className="mt-3 text-sm leading-relaxed">{item.text}</p>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

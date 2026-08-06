import { Sprout } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { StaggerGroup } from "./stagger-group";

const GROWTH_STAGES = [
  { icon: "🌱", time: "اليوم", label: "أول درس", note: "تبدأ شجرتك ببذرة" },
  { icon: "🌿", time: "بعد أسبوع", label: "أول وحدة", note: "النبتة تكبر" },
  { icon: "🌳", time: "بعد شهر", label: "استمرارك", note: "شجرة راسخة" },
  { icon: "🏆", time: "الإتقان", label: "إكمال المادة", note: "ثمرة رحلتك" },
];

/**
 * قسم "الإنجازات": قصة نمو زمنية من 🌱 إلى 🏆 — كل مرحلة ترتبط بفترة
 * زمنية (اليوم/أسبوع/شهر/إتقان) ليشعر الطالب بالنمو لا بجمع شارات.
 */
export function Achievements() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          متى تعرف أنك أتقنت الدرس؟
        </h2>
        <p className="mt-3 text-muted-foreground">
          شجرتك تنمو مع كل خطوة — وكل مرحلة تُفتح لاحقها.
        </p>
      </ScrollReveal>

      <StaggerGroup className="mt-14 mx-auto grid max-w-4xl grid-cols-4 gap-2 sm:gap-4" step={200}>
        {GROWTH_STAGES.map((stage) => (
          <div key={stage.label} className="relative flex flex-col items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-primary">
              {stage.time}
            </span>
            <span className="flex size-14 items-center justify-center rounded-full border bg-card text-3xl shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md">
              {stage.icon}
            </span>
            <p className="text-center text-sm font-semibold">{stage.label}</p>
            <p className="text-center text-xs text-muted-foreground">{stage.note}</p>
          </div>
        ))}
      </StaggerGroup>

      <ScrollReveal className="mt-12 flex justify-center" delay={300}>
        <p className="flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm text-muted-foreground">
          <Sprout className="size-4 text-primary" />
          كل إنجاز يجعل شجرتك تكبر — وكل شجرة تبدأ ببذرة صغيرة.
        </p>
      </ScrollReveal>
    </section>
  );
}

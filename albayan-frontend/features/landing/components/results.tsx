"use client";

import { ArrowDown, Sparkles, TrendingUp } from "lucide-react";
import { CountUp } from "./count-up";
import { ScrollReveal } from "./scroll-reveal";
import { StaggerGroup } from "./stagger-group";
import { cn } from "@/lib/utils";

const RESULTS = [
  {
    name: "بلال",
    before: 45,
    after: 91,
    beforeText: "كانت تعرف الأساسيات فقط",
    afterText: "أصبحت تحل معظم الأسئلة بنفسك",
  },
  {
    name: "سارة",
    before: 30,
    after: 82,
    beforeText: "كانت تخلط بين المبتدأ والخبر",
    afterText: "أصبحت تميّز الإعراب بثقة",
  },
  {
    name: "محمد",
    before: 55,
    after: 93,
    beforeText: "كانت ترتكب أخطاء شائعة",
    afterText: "أصبحت تصحّح أخطاءك بنفسك",
  },
];

/**
 * قسم "النتائج الحقيقية": Dashboard قبل/بعد لكل طالب مع عدّادات متحركة
 * ووصف إنساني بجانب الرقم — لأن الإنسان يتذكر الوصف أكثر من الرقم.
 * البيانات تجريبية (Mock) تُستبدل ببيانات حقيقية لاحقًا.
 */
export function Results() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ماذا يحدث عندما تقيس فهمك قبل وبعد؟
          </h2>
          <p className="mt-3 text-muted-foreground">
            هذا ليس مقارنة بغيرك... بل بنفسك. والرقم يصحبه وصف تعيشه.
          </p>
        </ScrollReveal>

        <StaggerGroup
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          step={150}
        >
          {RESULTS.map((result) => (
            <div
              key={result.name}
              className="rounded-3xl border bg-card p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-bold">{result.name}</span>
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  <TrendingUp className="size-3.5" />
                  +{result.after - result.before}%
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    قبل الدرس: {result.beforeText}
                  </p>
                  <ProgressRow label="قبل الدرس" value={result.before} />
                </div>
                <div className="flex justify-center">
                  <ArrowDown className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    بعد الدرس: {result.afterText}
                  </p>
                  <ProgressRow label="بعد الدرس" value={result.after} highlight />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-primary/10 py-3 text-sm font-bold text-primary">
                <Sparkles className="size-4" />
                لقد تحسّن {result.name} بنفسه
              </div>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

interface ProgressRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function ProgressRow({ label, value, highlight }: ProgressRowProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <CountUp end={value} suffix="%" className="font-bold text-foreground" />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            highlight ? "bg-primary" : "bg-muted-foreground/40",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

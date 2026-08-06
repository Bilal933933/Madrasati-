import { Check, X } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/lib/utils";

const OLD_WAY = [
  { icon: X, label: "الحفظ فقط" },
  { icon: X, label: "النسيان" },
  { icon: X, label: "فجوات معرفية" },
];

const NEW_WAY = [
  { icon: Check, label: "قياس مستمر" },
  { icon: Check, label: "مراجعة فورية" },
  { icon: Check, label: "إتقان حقيقي" },
];

/**
 * قسم "لماذا الطريقة تنجح؟": Timeline يقارن النموذج التقليدي
 * (حفظ/نسيان/فجوات) بمنهج مدرستي (قياس/مراجعة/إتقان).
 */
export function WhyItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          لماذا تنجح هذه الطريقة؟
        </h2>
        <p className="mt-3 text-muted-foreground">
          الفرق ليس في المحتوى... بل في متابعة الفهم لحظة بلحظة.
        </p>
      </ScrollReveal>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
        {/* الطريقة التقليدية */}
        <ScrollReveal delay={100}>
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="mb-5 font-bold text-destructive">الطريقة التقليدية</p>
            <div className="flex flex-col gap-3">
              {OLD_WAY.map((item, index) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-destructive/30 bg-background text-destructive">
                    <item.icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full bg-destructive/30 transition-all", index === 2 ? "w-full" : "w-2/3")}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">الخطوة {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* طريقة مدرستي */}
        <ScrollReveal delay={250}>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <p className="mb-5 font-bold text-primary">طريقة مدرستي</p>
            <div className="flex flex-col gap-3">
              {NEW_WAY.map((item, index) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${80 + index * 10}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">الخطوة {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

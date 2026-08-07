import { Bell, BookOpen, PartyPopper, TrendingUp } from "lucide-react";
import { FloatingCard } from "./floating-card";
import { ScrollReveal } from "./scroll-reveal";

/**
 * قسم "ولي الأمر والمعلم": بطاقة إشعار (Notification) واقعية توضح
 * التفاصيل التي يراها ولي الأمر — التحسن بالأرقام والوقت والمراجعة.
 * الفكرة تبيع المشروع حتى لو نُفذت لاحقًا.
 */
export function ParentTeacher() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <ScrollReveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            كيف يعرف ولي أمرك أنك تتحسن؟
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            لا تنتظر نهاية الفصل لتعرف. بعد كل درس يصلك إشعار بتفاصيل حقيقية:
            كم تحسّن، كم استغرق، وماذا راجع. وللمعلم، يظهر نفس التقدم في لوحة
            واضحة لكل طالب.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="flex justify-center">
          {/* بطاقة الهاتف */}
          <FloatingCard duration={7}>
            <div className="w-80 rounded-[2rem] border bg-background p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-3 border-b pb-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-bold">تقدم أحمد اليوم</p>
                  <p className="text-xs text-muted-foreground">الآن · إشعار جديد</p>
                </div>
              </div>

              <div className="rounded-2xl bg-primary/10 p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary">
                  <PartyPopper className="size-4" aria-hidden />
                  أحمد تحسّن اليوم
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                  <span className="text-muted-foreground">45%</span>
                  <span className="text-primary">←</span>
                  <span className="text-2xl font-extrabold text-primary">82%</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <DetailRow icon={BookOpen} text="استغرق 17 دقيقة" />
                <DetailRow icon={TrendingUp} text="أعاد فقرة واحدة فقط ثم أكمل" />
                <DetailRow icon={Bell} text="التقييم القبلي: 45% · النهائي: 82%" />
              </div>
            </div>
          </FloatingCard>
        </ScrollReveal>
      </div>
    </section>
  );
}

interface DetailRowProps {
  icon: typeof BookOpen;
  text: string;
}

function DetailRow({ icon: Icon, text }: DetailRowProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-muted/40 px-3 py-2.5">
      <span className="text-primary">
        <Icon className="size-4 shrink-0" />
      </span>
      <p className="text-xs leading-snug">{text}</p>
    </div>
  );
}

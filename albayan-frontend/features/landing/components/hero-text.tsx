import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TRUST_ITEMS = [
  { label: "تقييم قبلي" },
  { label: "قياس بعد كل فقرة" },
  { label: "مقارنة مستواك قبل وبعد" },
];

/**
 * عمود النص في الـ Hero (يمين في RTL):
 * Badge ← المشكلة التي يعيشها الطالب ← الحل ← الوعد العاطفي ← الأزرار ← عنصر الثقة.
 */
export function HeroText() {
  return (
    <div className="flex flex-col items-start gap-5">
      <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        تعلم بطريقة تقيس فهمك بعد كل خطوة
      </span>

      <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        هل تنتهي من الدرس
        <br />
        دون أن تعرف هل <span className="text-primary">فهمته فعلًا؟</span>
      </h1>

      <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
        لأن الهدف ليس إنهاء الدرس... بل أن تخرج وأنت واثق أنك فهمته. مدرستي
        تقيس فهمك بعد كل خطوة حتى تصل إلى الإتقان.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1 sm:w-auto">
          <Button asChild size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
            <Link href="/trial">
              جرّب أول درس مجانًا
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <span className="text-center text-xs text-muted-foreground sm:text-start">
            بدون تسجيل
          </span>
        </div>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 w-full px-6 text-base sm:w-auto"
        >
          <Link href="/subjects">استكشف المواد</Link>
        </Button>
      </div>

      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
        {TRUST_ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <CheckCircle2 className="size-4 text-primary" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

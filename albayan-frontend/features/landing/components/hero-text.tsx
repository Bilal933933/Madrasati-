import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaterialsLink } from "./materials-link";

const TRUST_ITEMS = [
  { label: "تقييم قبلي" },
  { label: "قياس بعد كل فقرة" },
  { label: "مقارنة مستواك قبل وبعد" },
];

/**
 * عمود النص في الـ Hero (يمين في RTL):
 * Badge الشخصية ← قصة الطالب (المشكلة) ← الحل الواعد ← الوصف ← الأزرار ← عنصر الثقة.
 */
export function HeroText() {
  return (
    <div className="flex flex-col items-start gap-5">
      <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        التعلم ليس سباقًا... بل رحلة
      </span>

      <h1 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
        كم مرة أنهيت درسًا... ثم اكتشفت في الامتحان أنك{" "}
        <span className="text-primary underline decoration-primary/20 underline-offset-8">لم تفهمه كما ظننت؟</span>
      </h1>

      <p className="max-w-md text-lg leading-relaxed text-muted-foreground/90 sm:text-xl">
        لهذا صممنا رحلة لا تسمح لك بالانتقال قبل أن تتأكد أنك فهمت. كل طالب
        يستحق أن يتعلم بثقة.
      </p>

      <div className="flex w-full flex-col gap-4 sm:w-auto">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-14 w-full bg-primary px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all sm:w-auto">
            <Link href="/trial">
              جرّب أول درس مجانًا
              <ArrowLeft className="mr-2 size-5 rtl:rotate-180" />
            </Link>
          </Button>
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 w-full border-2 px-8 text-lg font-semibold sm:w-auto"
            >
              <MaterialsLink>استكشف المواد</MaterialsLink>
            </Button>
            <span className="hidden text-xs font-bold text-primary sm:block">
              ← تعلّم الآن مجاناً
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <span className="h-px w-8 bg-border" />
          <span className="text-sm font-bold text-foreground">
            بدون تسجيل
          </span>
          <span className="h-px w-8 bg-border" />
        </div>
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

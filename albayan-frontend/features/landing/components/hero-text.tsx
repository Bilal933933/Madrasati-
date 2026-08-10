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

      <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        كم مرة أنهيت درسًا... ثم اكتشفت في الامتحان أنك{" "}
        <span className="text-primary">لم تفهمه كما ظننت؟</span>
      </h1>

      <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
        لهذا صممنا رحلة لا تسمح لك بالانتقال قبل أن تتأكد أنك فهمت. كل طالب
        يستحق أن يتعلم بثقة.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
          <Button asChild size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
            <Link href="/trial">
              جرّب أول درس مجانًا
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 w-full px-6 text-base sm:w-auto"
          >
            <MaterialsLink>استكشف المواد</MaterialsLink>
          </Button>
        </div>
        <span className="text-center text-xs text-muted-foreground sm:text-start">
          بدون تسجيل
        </span>
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

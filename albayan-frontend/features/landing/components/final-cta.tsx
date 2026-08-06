import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

/**
 * الدعوة الأخيرة: أول ظهور للتسجيل في الصفحة (بعد أن رأى الزائر القيمة).
 */
export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <ScrollReveal>
        <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            هل تريد أن ترى الفرق بنفسك؟
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            جرّب أول درس الآن — دون تسجيل. وعندما تريد أن تكمل، حسابك يستغرق دقيقة.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
              <Link href="/register">إنشاء حساب مجاني</Link>
            </Button>
            <span className="text-sm text-muted-foreground">أو</span>
            <Button asChild variant="outline" size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
              <Link href="/trial">
                جرّب أول درس
                <ArrowLeft className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

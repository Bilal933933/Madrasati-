"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";

/**
 * شاشة نهاية التجربة — لحظة التحويل (Visitor-Experience:8).
 * "أعجبتك الطريقة؟ أنشئ حسابًا مجانيًا لتكمل رحلتك" ← التسجيل، مع إعادة التجربة.
 */
export function TrialFinish({ onRetry }: { onRetry: () => void }) {
  const title = useLessonEngineStore((s) => s.data?.title) ?? "هذا الدرس";

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
      <CheckCircle2 className="size-14 text-emerald-600" aria-hidden />
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold leading-tight">أعجبتك الطريقة؟</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          أنهيت تجربة «{title}» — أنشئ حسابًا مجانيًا لتكمل رحلتك خطوة بخطوة.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button asChild size="lg" className="h-12 w-full text-base">
          <Link href="/register">أنشئ حسابًا مجانيًا</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
          <Link href="/explore">تصفح المزيد من المواد</Link>
        </Button>
        <Button type="button" variant="ghost" size="lg" className="h-12 w-full text-base" onClick={onRetry}>
          أعد التجربة
        </Button>
      </div>
    </div>
  );
}

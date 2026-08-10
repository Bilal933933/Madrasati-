"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

/**
 * حدود أخطاء موحّد — يُعاد استخدامه في ملفات error.tsx للمسارات الفرعية
 * وفي غلاف الصفحة الجذرية. يُعرض عند خطأ غير متوقع في سياق الصفحة
 * مع زر «إعادة المحاولة» (reset) للتعافي دون مغادرة المسار.
 */
export function ErrorFallback({
  error,
  reset,
  title = "حدث خطأ غير متوقع",
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message ||
            "تعذّر تحميل هذه الصفحة بشكل صحيح. يرجى محاولة إعادة التحميل."}
        </p>
      </div>
      <Button onClick={reset} variant="outline" className="mt-2">
        <RefreshCcw className="size-4" />
        إعادة المحاولة
      </Button>
    </div>
  );
}
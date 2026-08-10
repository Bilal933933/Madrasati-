"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ErrorFallback } from "@/components/shared/error-fallback";

/**
 * Error Boundary عام — يُعرض عند فشل غير متوقع في أي صفحة.
 * يحافظ على غلاف العلامة ويفوّض المحتوى لمكوّن ErrorFallback الموحّد.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center border-b px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight">مدرستي</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <ErrorFallback error={error} reset={reset} title="حدث خطأ ما" />
      </main>
    </div>
  );
}
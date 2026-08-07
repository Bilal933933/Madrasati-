"use client";

import { GraduationCap, Home, RefreshCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Error Boundary عام — يُعرض عند فشل غير متوقع في أي صفحة.
 */
export default function ErrorPage({
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

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="flex max-w-lg flex-col items-center text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-10" />
          </span>
          <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
            حدث خطأ ما
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            نعتذر عن الإزعاج، واجهت الصفحة مشكلة غير متوقعة. جرّب إعادة تحميل
            الصفحة أولًا، وإذا استمرت المشكلة فعد إلى الصفحة الرئيسية.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={reset}>
              <RefreshCcw className="size-4" />
              إعادة المحاولة
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="size-4" />
                الصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

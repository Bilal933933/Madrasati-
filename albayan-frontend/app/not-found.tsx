import { GraduationCap, Home, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * صفحة 404 — تُعرض عند فتح مسار غير موجود.
 */
export default function NotFoundPage() {
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
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="size-10" />
          </span>
          <p className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            الصفحة غير موجودة
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            عذرًا، يبدو أن الرابط الذي فتحته غير صحيح أو أن الصفحة نُقلت. تأكد من
            العنوان أو عد إلى صفحة البداية لمواصلة التعلم.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/">
              <Home className="size-4" />
              العودة إلى الصفحة الرئيسية
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

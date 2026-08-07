import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

/**
 * شاشة تحميل عامة — تظهر أثناء تحميل الصفحات (الانتقال بين المسارات).
 */
export default function LoadingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-14 items-center border-b px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight">مدرستي</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 sm:px-6">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      </main>
    </div>
  );
}

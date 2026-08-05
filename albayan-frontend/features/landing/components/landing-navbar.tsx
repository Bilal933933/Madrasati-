"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";

const NAV_LINKS = [
  { href: "#subjects", label: "المواد" },
  { href: "#how-it-works", label: "كيف نتأكد أنك فهمت؟" },
  { href: "#faq", label: "الأسئلة" },
];

/**
 * اليدر العام للبوابة (Public Landing Navbar):
 * شعار مدرستي + روابط أقسام الصفحة + زرا إجراء للزائر.
 * عند وجود مستخدم مسجل يُستبدل «جرّب مجانًا» برابط بيتي التعليمي.
 */
export function LandingNavbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight">مدرستي</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button asChild variant="ghost" className="h-9 px-3">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild className="h-9 px-3">
                <Link href="/trial">
                  <Sparkles className="size-4" />
                  جرّب مجانًا
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild className="h-9 px-3">
              <Link href="/">بيتي التعليمي</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

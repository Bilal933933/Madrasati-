"use client";

import { GraduationCap, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

/**
 * الهيدر العام: الشعار والعنوان في البداية (يمين RTL)،
 * وزر الثيم + قائمة المستخدم في النهاية (يسار RTL).
 * يظهر رابط "لوحة التحكم" للمشرف فقط، وزر "ابدأ الآن" للزائر.
 */
export function Header() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight">مدرستي</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="h-9 px-2.5 sm:px-3">
              <Link href="/admin">
                <LayoutDashboard />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </Link>
            </Button>
          )}
          {!user && (
            <Button asChild size="sm" className="h-9 px-3">
              <Link href="/register">ابدأ الآن</Link>
            </Button>
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

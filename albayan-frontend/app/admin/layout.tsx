"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { UserMenu } from "@/features/student/components/UserMenu";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // عدم وجود جلسة → نعيده لصفحة الدخول
  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);

  // جارٍ التحقق من الجلسة
  if (!isInitialized) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  // مستخدم مسجّل لكنه ليس أدمن → غير مصرّح
  if (user && user.role !== "admin") {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader className="items-center text-center">
            <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </span>
            <CardTitle className="text-xl">غير مصرّح</CardTitle>
            <CardDescription>
              عذرًا، هذه الصفحة مخصصة للمشرفين فقط.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
            {/* مجموعة البداية: Trigger + الشعار + العودة (truncate لتجنّب الدفع خارج الشاشة) */}
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="shrink-0" />
              <BrandMark className="size-7 shrink-0" iconClassName="size-4" />
              <Button
                asChild
                variant="ghost"
                className="hidden min-w-0 sm:inline-flex"
              >
                <Link href="/" className="gap-1.5">
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">العودة إلى الموقع</span>
                </Link>
              </Button>
            </div>

            {/* مجموعة النهاية: ثابتة لا تتغير */}
            <div className="flex shrink-0 items-center gap-1.5">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
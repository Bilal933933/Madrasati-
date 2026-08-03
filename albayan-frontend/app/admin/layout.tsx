"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

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
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  // مستخدم مسجّل لكنه ليس أدمن → غير مصرّح
  if (user && user.role !== "admin") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
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
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
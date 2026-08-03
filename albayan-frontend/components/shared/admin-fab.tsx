"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import { DASHBOARD_LINKS } from "@/features/admin/dashboard-links";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/callback"];

/**
 * زر عائم (Drawer) يظهر للأدمن فقط في صفحات الطالب،
 * يفتح نسخة من محتوى لوحة التحكم للانتقال السريع للأقسام.
 */
export function AdminFab() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isInsideAdminPanel = pathname.startsWith("/admin");
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (!isAdmin || isInsideAdminPanel || isAuthPage) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="لوحة التحكم"
          className="fixed bottom-6 left-6 z-50 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LayoutDashboard className="size-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>لوحة التحكم</DrawerTitle>
          <DrawerDescription>
            أهلاً بك في لوحة إدارة مدرستي — اختر قسمًا للإدارة.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 scroll-fade overflow-y-auto px-4 pb-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {DASHBOARD_LINKS.map((item) => (
              <DrawerClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              </DrawerClose>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">إغلاق</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
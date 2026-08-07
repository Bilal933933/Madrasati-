"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteNavbar } from "@/components/shared/site-navbar";
import { useAuthStore } from "@/features/auth/store/authStore";

const NAV_LINKS = [
  { href: "#subjects", label: "المواد" },
  { href: "#how-it-works", label: "كيف تعمل؟" },
  { href: "#why-it-works", label: "لماذا تختلف؟" },
  { href: "#faq", label: "الأسئلة" },
];

/**
 * الهيدر العام للبوابة (Public Landing Navbar) — إعداد من المكوّن العام
 * SiteNavbar (نمط Floating Pill) بنمط عائم مع زجاجية، روابط الأقسام
 * وأزرار إجراء تعتمد على حالة تسجيل الدخول وقائمة أقسام للجوال تعرض
 * أيقونات عند توفّرها.
 */
export function LandingNavbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <SiteNavbar
      links={NAV_LINKS}
      actions={
        user ? (
          <Button asChild className="rounded-full">
            <Link href="/home">بيتي التعليمي</Link>
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              className="hidden h-9 rounded-full px-4 text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild className="h-9 rounded-full px-4">
              <Link href="/trial">
                <Sparkles className="size-4" />
                جرّب مجانًا
              </Link>
            </Button>
          </>
        )
      }
      mobileActions={(close) =>
        user ? (
          <Button asChild className="w-full rounded-full">
            <Link href="/home" onClick={close}>
              بيتي التعليمي
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/login" onClick={close}>
                تسجيل الدخول
              </Link>
            </Button>
            <Button asChild className="w-full rounded-full">
              <Link href="/trial" onClick={close}>
                جرّب مجانًا
              </Link>
            </Button>
          </>
        )
      }
    />
  );
}
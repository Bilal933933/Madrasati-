"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserMenu } from "@/features/student/components/UserMenu";
import { LandingFooter } from "@/features/landing/components/footer";

/**
 * هيكل بيت الطالب: بار تنقّل خاص بالطالب (شعار + قائمة مستخدم) + محتوى + فوتر البوابة.
 * حارس تسجيل دخول: الزائر يُعاد إلى /login، والمدير لا يُمنع (يرى واجهة ربط
 * البيانات الدراسية لأنّه بلا ملف طالب بعد).
 */
export default function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <span className="text-base font-bold tracking-tight">مدرستي</span>
          </Link>

          <UserMenu />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <LandingFooter />
    </div>
  );
}

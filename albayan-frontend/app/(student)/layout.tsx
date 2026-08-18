"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/shared/loader";
import { SiteNavbar } from "@/components/shared/site-navbar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { StudentDock } from "@/features/student/components/student-dock";
import { UserMenu } from "@/features/student/components/UserMenu";
import { STUDENT_LINKS, studentDockItems } from "@/features/student/constants/nav";
import { LandingFooter } from "@/features/landing/components/footer";

/**
 * هيكل مناطق الطالب الموحّد (بيت الطالب · نتائجي · الامتحانات · الإنجازات):
 * حارس تسجيل دخول + SiteNavbar (روابط STUDENT_LINKS) + محتوى بحشوة
 * قابلة للضبط من CSS vars (--dock-inset-*) + فوتر البوابة + StudentDock موحّد.
 * الصفحات الغامرة (/exams/attempt و /ai-tutor) تعيش في (workspace) خارج هذا الهيكل.
 */
export default function StudentAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useLogout();

  const dockItems = studentDockItems(router, {
    isAdmin: user?.role === "admin",
    withAiTutor: true,
    onLogout: () => logout.mutate(),
  });

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);

  if (!isInitialized) {
    return <Loader className="translate-y-12" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNavbar brandHref="/home" links={STUDENT_LINKS} actions={<><ThemeToggle /><UserMenu /></>} />

      <main className="flex-1 pb-[var(--dock-inset-y)] md:pb-0 md:pe-[var(--dock-inset-x)]">
        {children}
      </main>

      <LandingFooter />

      <StudentDock items={dockItems} />
    </div>
  );
}
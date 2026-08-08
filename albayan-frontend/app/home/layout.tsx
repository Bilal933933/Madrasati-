"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  GraduationCap,
  Home as HomeIcon,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Loader } from "@/components/shared/loader";
import { SiteNavbar } from "@/components/shared/site-navbar";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { StudentDock } from "@/features/student/components/student-dock";
import { UserMenu } from "@/features/student/components/UserMenu";
import { LandingFooter } from "@/features/landing/components/footer";

/**
 * هيكل بيت الطالب: بار تنقّل عائم عام موحّد (SiteNavbar) بشعار + قائمة
 * المستخدم + محتوى + فوتر البوابة + شريط سفلي جوال (StudentDock).
 * حارس تسجيل الدخول: الزائر يُعاد إلى /login، والمدير لا يُمنع (يرى واجهة
 * ربط البيانات الدراسية لأنّه بلا ملف طالب بعد).
 */
export default function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useLogout();

  const dockItems = [
    {
      icon: <HomeIcon size={16} />,
      label: "الرئيسية",
      onClick: () => router.push("/home"),
    },
    {
      icon: <Compass size={16} />,
      label: "المواد",
      onClick: () => router.push("/explore"),
    },
    {
      icon: <GraduationCap size={16} />,
      label: "الامتحانات",
      onClick: () => router.push("/exams"),
    },
    ...(user?.role === "admin"
      ? [
          {
            icon: <LayoutDashboard size={16} />,
            label: "لوحة التحكم",
            onClick: () => router.push("/admin"),
          },
        ]
      : []),
    {
      icon: <LogOut size={16} />,
      label: "تسجيل الخروج",
      onClick: () => logout.mutate(),
    },
  ];

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
      <SiteNavbar brandHref="/home" actions={<UserMenu />} />

      <main className="flex-1 pb-28 lg:pb-0 lg:pe-28">{children}</main>

      <LandingFooter />

      <StudentDock items={dockItems} />
    </div>
  );
}

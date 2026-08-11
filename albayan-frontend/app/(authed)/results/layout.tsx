"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Compass,
  GraduationCap,
  Home as HomeIcon,
  LogOut,
  Medal,
} from "lucide-react";
import { Loader } from "@/components/shared/loader";
import { SiteNavbar, type NavItem } from "@/components/shared/site-navbar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { StudentDock } from "@/features/student/components/student-dock";
import { UserMenu } from "@/features/student/components/UserMenu";

/**
 * شل منطقة نتائجي: حارس تسجيل دخول + هيدر موحّد + شريط سفلي جوال.
 */
export default function ResultsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useLogout();

  const links: NavItem[] = [
    { href: "/home", label: "الرئيسية" },
    { href: "/home", label: "المواد" },
    { href: "/exams", label: "الامتحانات" },
    { href: "/results", label: "نتائجي" },
    { href: "/achievements", label: "الإنجازات" },
  ];

  const dockItems = [
    {
      icon: <HomeIcon size={16} />,
      label: "الرئيسية",
      onClick: () => router.push("/home"),
    },
    {
      icon: <Compass size={16} />,
      label: "المواد",
      onClick: () => router.push("/home"),
    },
    {
      icon: <GraduationCap size={16} />,
      label: "الامتحانات",
      onClick: () => router.push("/exams"),
    },
    {
      icon: <BarChart3 size={16} />,
      label: "نتائجي",
      onClick: () => router.push("/results"),
    },
    {
      icon: <Medal size={16} />,
      label: "الإنجازات",
      onClick: () => router.push("/achievements"),
    },
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
      <SiteNavbar brandHref="/home" links={links} actions={<><ThemeToggle /><UserMenu /></>} />

      <main className="flex-1 pb-28">{children}</main>

      <StudentDock items={dockItems} />
    </div>
  );
}

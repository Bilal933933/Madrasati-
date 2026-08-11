"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/shared/loader";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * غلاف مساحة عمل المعلم الذكي — تطبيق تفاعلي كامل الارتفاع:
 * لا فوتر تسويقي ولا SiteNavbar ولا StudentDock ولا تمرير body عام.
 * إطار مغلق (h-dvh + overflow-hidden) يمنح الدردشة كل المساحة الرأسية.
 */
export default function AiTutorWorkspaceLayout({
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
    return <Loader className="translate-y-12" />;
  }

  if (!user) {
    return null;
  }

  return <div className="flex h-dvh flex-col overflow-hidden">{children}</div>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/shared/loader";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * تخطيط غامر لصفحة الأداء — بلا هيدر أو شريط سفلي لتفرّغ الطالب للاختبار.
 */
export default function AttemptLayout({
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

  return <>{children}</>;
}
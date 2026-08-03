"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isInitialized) {
      router.replace(user ? "/" : "/login");
    }
  }, [isInitialized, user, router]);

  return (
    <AuthShell title="جارٍ تسجيل الدخول" description="نستكمل المصادقة عبر جوجل...">
      <div className="flex items-center justify-center py-4">
        <Spinner className="size-8 text-primary" />
      </div>
    </AuthShell>
  );
}

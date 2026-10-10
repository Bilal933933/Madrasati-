"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { authApi } from "@/features/auth/services/authApi";

export default function AuthCallbackPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    // بعد عودة جوجل الكوكي جديد — لا تعتمد على كاش ["auth","current-user"]
    // (قد يكون 401 قديمًا من زيارة /login)، بل اجلب المستخدم طازجًا.
    queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });

    authApi
      .getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setInitialized(true);
        queryClient.setQueryData(["auth", "current-user"], user);
        router.replace("/home");
      })
      .catch(() => {
        if (cancelled) return;
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setInitialized(true);
        router.replace("/login?error=google_failed");
      });

    return () => {
      cancelled = true;
    };
  }, [queryClient, router]);

  return (
    <AuthShell title="جارٍ تسجيل الدخول" description="نستكمل المصادقة عبر جوجل...">
      <div className="flex items-center justify-center py-4">
        <Spinner className="size-8 text-primary" />
      </div>
    </AuthShell>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
    <main className="flex flex-1 items-center justify-center">
      <p className="text-muted-foreground">جارٍ التحقق من الحساب...</p>
    </main>
  );
}

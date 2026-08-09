"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * رابط «المواد» الواعي بحالة الدخول:
 * الزائر → /explore (صفحات الاستكشاف العامة)،
 * المستخدم المسجّل → /home (بيته التعليمي) حتى لا يُرمى في صفحات الزائر.
 */
export function MaterialsLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const user = useAuthStore((state) => state.user);

  return (
    <Link href={user ? "/home" : "/explore"} className={className}>
      {children}
    </Link>
  );
}
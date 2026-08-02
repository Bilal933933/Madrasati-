"use client";

import type { ReactNode } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";

/**
 * يُستدعى مرة واحدة عند تحميل التطبيق للتحقق من الجلسة الحالية.
 * لا يعرض أي واجهة إضافية — فقط يُشغّل عملية التحقق في الخلفية.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useCurrentUser();

  return <>{children}</>;
}

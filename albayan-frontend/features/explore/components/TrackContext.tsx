"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { userContextApi } from "../services/userContextApi";

/**
 * يحدّث سياق التصفح عند فتح صفحة مادة لمستخدم مسجّل.
 * الزائر لا يُرسل شيئًا، وفشل الحفظ يُتجاهل بصمت (لا يعرقل التصفح).
 */
export function TrackContext({ subjectSlug }: { subjectSlug: string }) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      return;
    }
    userContextApi.update(subjectSlug).catch(() => {
      // تجاهل صامت — انتهاء جلسة/خطأ شبكة لا يكسر تجربة التصفح.
    });
  }, [user, subjectSlug]);

  return null;
}

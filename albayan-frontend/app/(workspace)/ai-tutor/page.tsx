"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/shared/loader";
import { createAiThread } from "@/features/ai-tutor/services/aiApi";

/**
 * المسار الجذر للمعلم الذكي — يفتح جلسة جديدة فورًا (مثل Claude Code)
   ثم يعيد التوجيه إلى /ai-tutor/[threadId] لعرض الشريط الجانبي والدردشة معًا.
 */
export default function AiTutorRootPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    createAiThread()
      .then((thread) => {
        if (!cancelled) router.replace(`/ai-tutor/${thread.id}`);
      })
      .catch(() => {
        if (!cancelled) router.replace("/home");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <Loader className="translate-y-12" />;
}

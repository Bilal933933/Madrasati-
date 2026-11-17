import { SandboxLessonPage } from "@/features/lab-sandbox/components/sandbox-lesson-page";
import type { SandboxTheme } from "@/features/lab-sandbox/components/lab-sandbox-page";
import { parseVariant } from "@/features/lab-sandbox/variants";

/** محاكاة الدرس الكامل — ملف إضافي بحت داخل app/sandbox */
export default async function SandboxLessonRoute({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string; theme?: string }>;
}) {
  const query = await searchParams;
  const theme: SandboxTheme = query.theme === "dark" ? "dark" : "light";
  const variant = query.variant ? parseVariant(query.variant) : "compact";

  return <SandboxLessonPage variant={variant} theme={theme} />;
}

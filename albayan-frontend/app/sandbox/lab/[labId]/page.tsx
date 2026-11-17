import {
  LabSandboxPage,
  type SandboxTheme,
} from "@/features/lab-sandbox/components/lab-sandbox-page";
import { parseVariant } from "@/features/lab-sandbox/variants";

/**
 * مسار البيئة المعزولة — ملف إضافي بحت.
 * كل شيء هنا يُحذف مع `app/sandbox` و`features/lab-sandbox`.
 */
export default async function SandboxLabRoute({
  params,
  searchParams,
}: {
  params: Promise<{ labId: string }>;
  searchParams: Promise<{ variant?: string; theme?: string }>;
}) {
  const [{ labId }, query] = await Promise.all([params, searchParams]);
  const theme: SandboxTheme = query.theme === "dark" ? "dark" : "light";

  return <LabSandboxPage labId={labId} variant={parseVariant(query.variant)} theme={theme} />;
}

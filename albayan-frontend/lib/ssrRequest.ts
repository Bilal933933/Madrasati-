import { cookies, headers } from "next/headers";
import type { SsrContext } from "@/features/student/services/studentHomeApi";

/**
 * يبني سياق الطلب أثناء SSR (Server Components) لتمريره إلى الباك:
 * كوكيز المتصفح الوارد + أصله (Origin).
 *
 * Sanctum في وضع stateful يرفض جلسة SPA ما لم يأتِ الطلب من أصل
 * (Origin/Referer) مُدرج في SANCTUM_STATEFUL_DOMAINS، لذا لا يكفي
 * تمرير الكوكيز وحدها — يجب إرفاق Origin أيضًا.
 */
export async function getSsrRequestContext(): Promise<SsrContext> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return {
    cookie: cookieStore.toString(),
    origin: `${protocol}://${host}`,
  };
}

import { getAiSessionTicket, AI_BASE_URL } from "../../services/aiApi";
import type {
  AiAdminStats,
  AiAdminThreadDetail,
  AiAdminThreadList,
} from "../types/ai-admin.types";

/**
 * مراجعة جلسات المعلم الآلي من لوحة الأدمن — يستخدم تذكرة AI للمشرف
 * (Laravel تُصدر الآن تذاكر للأدمن) ثم يستدعي endpoints المراجعة في NestJS.
 */
async function aiAdminRest<T>(path: string): Promise<T> {
  const { token } = await getAiSessionTicket();
  const response = await fetch(`${AI_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw {
      status: response.status,
      message:
        errorBody?.message ?? "حدث خطأ أثناء قراءة جلسات المعلم الآلي.",
    };
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const aiAdminApi = {
  stats: () => aiAdminRest<AiAdminStats>("/api/admin/ai-threads/stats"),

  list: (params: { page?: number; perPage?: number; search?: string }) => {
    const query = new URLSearchParams({
      ...(params.page ? { page: String(params.page) } : {}),
      ...(params.perPage ? { perPage: String(params.perPage) } : {}),
      ...(params.search ? { search: params.search } : {}),
    }).toString();
    return aiAdminRest<AiAdminThreadList>(`/api/admin/ai-threads${query ? `?${query}` : ""}`);
  },

  detail: (id: string) =>
    aiAdminRest<AiAdminThreadDetail>(`/api/admin/ai-threads/${id}`),
};
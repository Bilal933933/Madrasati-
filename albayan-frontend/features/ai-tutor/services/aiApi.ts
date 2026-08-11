import { apiClient } from "@/lib/apiClient";
import type {
  AiSessionTicket,
  AiThreadDetail,
  AiThreadSummary,
} from "../types/ai-chat.types";

/**
 * عنوان خادم المعلم الذكي (NestJS) — نفس مضيف الـ Socket.IO بدون نطاق "chat".
 * REST endpoints مثل /api/threads تُستدعى مباشرة من المتصفح.
 */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_AI_SOCKET_URL?.trim() || "http://localhost:3001/chat";

const AI_BASE_URL = SOCKET_URL.replace(/\/chat\/?$/, "") || "http://localhost:3001";

let ticketCache: { token: string; expiresAt: number } | null = null;
let ticketPromise: Promise<string> | null = null;

/**
 * يجلب تذكرة جلسة المعلم الذكي من Laravel مع تخزين مؤقت:
 * - يُعاد استخدام التذكرة حتى بقاء أقل من 3 دقائق على انتهائها.
 * - الطلبات المتزامنة تشارك نفس الوعد (لا تكرار طلبات).
 * - الخطأ (401/403/…) يُرمى بمعيار lib/apiErrors عبر apiClient.
 */
export async function getAiSessionTicket(): Promise<AiSessionTicket> {
  return apiClient<AiSessionTicket>("/api/ai/session", {
    method: "POST",
    withCsrf: true,
  });
}

async function ensureTicket(): Promise<string> {
  const now = Date.now();
  if (ticketCache && ticketCache.expiresAt - now > 3 * 60_000) {
    return ticketCache.token;
  }

  if (!ticketPromise) {
    ticketPromise = getAiSessionTicket()
      .then((ticket) => {
        ticketCache = {
          token: ticket.token,
          expiresAt: now + ticket.expires_in * 1000,
        };
        ticketPromise = null;
        return ticket.token;
      })
      .catch((error) => {
        ticketPromise = null;
        throw error;
      });
  }

  return ticketPromise;
}

/** طلب REST موحّد نحو NestJS مع تذكرة Bearer تلقائية. */
async function aiRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await ensureTicket();
  const response = await fetch(`${AI_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw {
      status: response.status,
      message: errorBody?.message ?? "حدث خطأ في المعلم الذكي. حاول مرة أخرى.",
    };
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** إنشاء جلسة محادثة جديدة. */
export async function createAiThread(): Promise<AiThreadDetail> {
  return aiRest<AiThreadDetail>("/api/threads", { method: "POST", body: "{}" });
}

/** قائمة جلسات الطالب مرتبة بالأحدث. */
export async function listAiThreads(): Promise<AiThreadSummary[]> {
  return aiRest<AiThreadSummary[]>("/api/threads");
}

/** جلسة كاملة مع رسائلها. */
export async function getAiThread(threadId: string): Promise<AiThreadDetail> {
  return aiRest<AiThreadDetail>(`/api/threads/${threadId}`);
}

/** حذف جلسة مع رسائلها (Cascade). */
export async function deleteAiThread(threadId: string): Promise<void> {
  await aiRest<{ success: boolean }>(`/api/threads/${threadId}`, { method: "DELETE" });
}

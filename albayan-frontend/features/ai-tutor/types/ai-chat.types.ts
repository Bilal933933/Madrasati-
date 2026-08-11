/**
 * أنواع المعلم الذكي (AI Tutor) — الجانب الأمامي فقط.
 * تُطابق أحداث الـ Socket.IO الصادرة من خادم NestJS (namespace "chat")
 * وواجهات REST لإدارة الجلسات (/api/threads).
 */

/** سؤال اختبار يولّده المعلم الذكي عبر Structured Output (JSON) */
export interface QuizQuestion {
  subject?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

/** رسالة داخل واجهة الدردشة — الشكل المحلي بعد تعيينه من DTO الخادم */
export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** نوع عرض الرسالة: نص عادي يُمرَّر عبر Markdown، أو بطاقة سؤال */
  kind?: "text" | "quiz";
  quiz?: QuizQuestion;
}

export type AiChatStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "busy"
  | "error"
  | "offline"
  | "signedOut";

/** استجابة POST /api/ai/session من Laravel */
export interface AiSessionTicket {
  token: string;
  expires_in: number;
}

/** ملخص جلسة في الشريط الجانبي (GET /api/threads) */
export interface AiThreadSummary {
  id: string;
  title: string;
  updatedAt: string | null;
  messageCount: number;
  lastMessage: string | null;
}

/** رسالة كما تصل من الخادم (GET /api/threads/:id) */
export interface AiMessageDto {
  id: string;
  sender: "USER" | "ASSISTANT";
  kind: "text" | "quiz";
  content: string;
  metadata: unknown;
  createdAt: string;
}

/** جلسة كاملة مع رسائلها (POST /api/threads و GET /api/threads/:id) */
export interface AiThreadDetail {
  id: string;
  subjectId: string | null;
  lessonId: string | null;
  title: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  messages: AiMessageDto[];
}

/** الحقول الفعلية القادمة من الخادم عند تجميع جواب المعلم */
export interface AiSocketEvents {
  status: { status?: string; message?: string };
  "response-chunk": { chunk: string };
  "response-complete": { success?: boolean; sources?: unknown[] };
  "quiz-question": { question: QuizQuestion };
  error: { message?: string };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAiSessionTicket, getAiThread } from "../services/aiApi";
import type {
  AiChatMessage,
  AiChatStatus,
  AiMessageDto,
  QuizQuestion,
} from "../types/ai-chat.types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_AI_SOCKET_URL?.trim() || "http://localhost:3001/chat";

const READY_TEXT = "جاهز للأسئلة";

let counter = 0;
function nextId(prefix: "user" | "assistant"): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter.toString(36)}`;
}

/** تعيين رسالة الخادم (DTO) إلى شكل الواجهة المحلي. */
function mapMessageDto(dto: AiMessageDto): AiChatMessage {
  if (dto.kind === "quiz") {
    try {
      const quiz = JSON.parse(dto.content) as QuizQuestion;
      return { id: dto.id, role: "assistant", text: "", kind: "quiz", quiz };
    } catch {
      // بطاقة تالفة — اعرضها كنص خام
    }
  }
  return {
    id: dto.id,
    role: dto.sender === "USER" ? "user" : "assistant",
    text: dto.content,
  };
}

/**
 * إدارة اتصال Socket.IO بمعلم الذكاء الاصطناعي لجلسة (thread) واحدة:
 * - جلب التذكرة من Laravel ثم فتح الاتصال بالـ handshake auth.
 * - تحميل سجل الرسائل من REST عند فتح الجلسة.
 * - إرسال { threadId, question } عبر حدث "question".
 * - توليف رسائل الدفق (response-chunk) في رسالة مساعد واحدة.
 * - حفظ الرسائل يتم في الخادم تلقائيًا؛ الواجهة تعرضها فقط.
 * - `logout` ينهي الجلسة، و`signIn` يعيد فتحها — بأسلوب Claude.
 */
export function useAiTutorChat(threadId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const assistantIdRef = useRef<string | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [status, setStatus] = useState<AiChatStatus>("idle");
  const [statusText, setStatusText] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | undefined>(undefined);

  /** تحميل جارٍ عندما يختلف threadId عن آخر محادثة حُمّلت فعليًا. */
  const isLoadingHistory = Boolean(threadId) && loadedFor !== threadId;

  /** تحميل سجل الرسائل من الخادم عند فتح الجلسة أو التبديل بين المحادثات. */
  useEffect(() => {
    if (!threadId) return;

    let cancelled = false;
    getAiThread(threadId)
      .then((thread) => {
        if (cancelled) return;
        setMessages(thread.messages.map(mapMessageDto));
        setLoadedFor(threadId);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadedFor(threadId);
        setStatus("error");
        setStatusText("تعذّر تحميل المحادثة. حاول إعادة تحميل الصفحة.");
      });

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const connect = useCallback(async (): Promise<void> => {
    setStatus("connecting");
    setStatusText("جاري تجهيز جلسة المعلم الذكي...");

    let socket: Socket | null = null;
    try {
      const { token } = await getAiSessionTicket();
      if (!mountedRef.current) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        if (!mountedRef.current) return;
        setStatus("connected");
        setStatusText(READY_TEXT);
      });

      socket.on("connect_error", (error: Error) => {
        if (!mountedRef.current) return;
        const message =
          error.message === "jwt expired"
            ? "انتهت صلاحية الجلسة. أعد تحميل الصفحة للمتابعة."
            : "تعذّر الاتصال بالمعلم الذكي. جارٍ إعادة المحاولة...";
        setStatus("connecting");
        setStatusText(message);
      });

      socket.on("status", (data: { status?: string; message?: string }) => {
        if (!mountedRef.current) return;
        setStatusText(data?.message || data?.status || READY_TEXT);
      });

      socket.on("response-chunk", (data: { chunk?: string }) => {
        const chunk = data?.chunk;
        if (!mountedRef.current || !chunk) return;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && assistantIdRef.current && last.id === assistantIdRef.current) {
            next[next.length - 1] = { ...last, text: last.text + chunk };
            return next;
          }
          const id = assistantIdRef.current ?? nextId("assistant");
          assistantIdRef.current = id;
          next.push({ id, role: "assistant", text: chunk });
          return next;
        });
      });

      socket.on("response-complete", () => {
        if (!mountedRef.current) return;
        assistantIdRef.current = null;
        busyRef.current = false;
        setStatus("connected");
        setStatusText(READY_TEXT);
      });

      socket.on(
        "quiz-question",
        (data: { question?: QuizQuestion }) => {
          const question = data?.question;
          if (!mountedRef.current || !question || !question.question) return;
          assistantIdRef.current = null;
          setMessages((prev) => [
            ...prev,
            {
              id: nextId("assistant"),
              role: "assistant",
              text: "",
              kind: "quiz",
              quiz: question,
            },
          ]);
        }
      );

      socket.on("error", (data: { message?: string }) => {
        if (!mountedRef.current) return;
        assistantIdRef.current = null;
        busyRef.current = false;
        setStatus("error");
        setStatusText(data?.message || "حدث خطأ في المعلم الذكي.");
      });

      socket.on("disconnect", () => {
        if (!mountedRef.current) return;
        busyRef.current = false;
        setStatus("offline");
        setStatusText("انقطع الاتصال بالمعلم الذكي.");
      });
    } catch {
      if (!mountedRef.current) return;
      setStatus("error");
      setStatusText("تعذّر بدء جلسة المعلم الذكي. تحقق من تسجيل الدخول وحاول مجددًا.");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const connectTimer = window.setTimeout(() => void connect(), 0);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(connectTimer);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connect]);

  const sendMessage = useCallback(
    (text: string): void => {
      const question = text.trim();
      if (!question || busyRef.current || !threadId) return;

      const socket = socketRef.current;
      if (!socket?.connected) {
        setStatus("error");
        setStatusText("لا يوجد اتصال بالمعلم الذكي. أعد تحميل الصفحة.");
        return;
      }

      busyRef.current = true;
      assistantIdRef.current = nextId("assistant");

      setMessages((prev) => [
        ...prev,
        { id: nextId("user"), role: "user", text: question },
      ]);
      setStatus("busy");
      setStatusText("جاري جمع السياق وتجهيز الإجابة...");
      socket.emit("question", { threadId: Number(threadId), question });
    },
    [threadId]
  );

  const generateQuestion = useCallback((): void => {
    if (busyRef.current || !threadId) return;

    const socket = socketRef.current;
    if (!socket?.connected) {
      setStatus("error");
      setStatusText("لا يوجد اتصال بالمعلم الذكي. أعد تحميل الصفحة.");
      return;
    }

    busyRef.current = true;
    setStatus("busy");
    setStatusText("جاري إنشاء سؤال اختبار...");
    socket.emit("generate-question", { threadId: Number(threadId) });
  }, [threadId]);

  /** إنهاء جلسة المعلم الذكي: فصل الـ Socket ومسح المحادثة — يبقى داخل المنصة. */
  const logout = useCallback(() => {
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();
    socketRef.current = null;
    assistantIdRef.current = null;
    busyRef.current = false;
    setMessages([]);
    setStatus("signedOut");
    setStatusText("تم تسجيل الخروج من المعلم الذكي.");
  }, []);

  /** إعادة فتح جلسة المعلم الذكي بعد تسجيل الخروج. */
  const signIn = useCallback(() => {
    void connect();
  }, [connect]);

  return {
    messages,
    status,
    statusText,
    isLoadingHistory,
    sendMessage,
    generateQuestion,
    logout,
    signIn,
  };
}

export type UseAiTutorChatReturn = ReturnType<typeof useAiTutorChat>;

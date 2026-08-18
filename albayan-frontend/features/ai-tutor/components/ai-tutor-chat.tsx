"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  LogIn,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/shared/loader";
import type { UseAiTutorChatReturn } from "../hooks/useAiTutorChat";
import { ChatMarkdown } from "./chat-markdown";
import { QuizCard } from "./quiz-card";
import { QUICK_PROMPTS } from "../constants/prompts";

/**
 * حاوية محادثة المعلم الذكي — بدون أي هيدر علوي (بأسلوب Gemini):
 * محتوى المحادثة + شريط إدخال سفلي فقط. كل التحكم في الشريط الجانبي.
 */
export function AiTutorChat({ chat }: { chat: UseAiTutorChatReturn }) {
  const {
    messages,
    status,
    statusText,
    isLoadingHistory,
    sendMessage,
    generateQuestion,
    signIn,
  } = chat;
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const busy = status === "busy";
  const connected = status === "connected";
  const signedOut = status === "signedOut";
  const hasError = status === "error" || status === "offline";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function handleSend(text: string): void {
    const q = text.trim();
    if (!q || busy || !connected) return;
    sendMessage(q);
    setDraft("");
    inputRef.current?.focus();
  }

  function handleNewChat(): void {
    router.push("/ai-tutor");
  }

  /** تنسيق وقت الرسالة بالأرقام العربية («٤:٢٥ م») مع تجاهل القيم الغائبة. */
  function formatTime(iso?: string): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleTimeString("ar", { hour: "numeric", minute: "2-digit" });
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden bg-[#faf6ee] text-foreground">
      {/* شاشة تسجيل الخروج — بأسلوب Claude/ChatGPT */}
      {signedOut ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-[#3a2313] text-[#f5e9d8] shadow-lg shadow-[#3a2313]/20">
            <Sparkles size={32} />
          </span>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#2b1a0e] sm:text-3xl">
              وداعًا! لقد سجّلت خروجك
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-foreground/70">
              أنهيت جلسة المعلم الذكي. يمكنك العودة في أي وقت لمواصلة التعلم.
            </p>
          </div>
          <Button onClick={signIn} className="gap-2 rounded-2xl px-6">
            <LogIn className="size-4" aria-hidden />
            العودة إلى المعلم الذكي
          </Button>
        </div>
      ) : (
      <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        {isLoadingHistory ? (
          <Loader className="translate-y-12" />
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-7">
            <span className="flex size-16 items-center justify-center rounded-3xl bg-[#3a2313] text-[#f5e9d8] shadow-lg shadow-[#3a2313]/20">
              <Sparkles size={32} />
            </span>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#2b1a0e] sm:text-3xl">
                كيف أساعدك اليوم؟
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-foreground/70">
                المعلم الذكي يجيبك حسب مستواك ومحتوى منهجك الدراسي.
              </p>
            </div>

            {connected ? (
              <div className="flex w-full max-w-2xl flex-col items-center gap-3">
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="group rounded-2xl border border-border/70 bg-white/80 p-4 text-start shadow-sm transition-colors hover:border-[#3a2313]/30 hover:bg-[#f5e9d8]/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <p className="text-sm font-medium leading-relaxed text-foreground/85 group-hover:text-[#2b1a0e]">
                        {prompt}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={generateQuestion}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-2xl border border-[#3a2313]/20 bg-[#3a2313] px-5 py-2.5 text-sm font-medium text-[#f5e9d8] shadow-sm transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
                >
                  <ClipboardList className="size-4" aria-hidden />
                  أنشئ سؤال اختبار
                </button>
              </div>
            ) : (
              <p className="text-sm text-foreground/70">{statusText || "جارٍ التجهيز..."}</p>
            )}
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex w-full flex-col items-start gap-1.5" dir="rtl">
                  <span className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground/70">
                    <Sparkles className="size-3.5" aria-hidden />
                    المعلم الذكي
                  </span>
                  {message.kind === "quiz" && message.quiz ? (
                    <QuizCard quiz={message.quiz} />
                  ) : (
                    <div className="w-fit max-w-[85%] rounded-2xl rounded-tr-sm border border-border/50 bg-gradient-to-b from-white to-[#f5e9d8]/60 px-4 py-3 text-sm leading-relaxed text-[#2b1a0e] shadow-sm">
                      {message.text ? (
                        <ChatMarkdown>{message.text}</ChatMarkdown>
                      ) : null}
                    </div>
                  )}
                  {formatTime(message.createdAt) && (
                    <span className="px-1 text-[11px] text-foreground/45">
                      {formatTime(message.createdAt)}
                    </span>
                  )}
                </div>
              ) : (
                <div key={message.id} className="flex w-full flex-col items-end gap-1.5" dir="rtl">
                  <span className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground/70">
                    أنت
                  </span>
                  <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-gradient-to-b from-[#4a2c17] to-[#3a2313] px-4 py-3 text-sm leading-relaxed text-white shadow-md">
                    {message.text}
                  </div>
                  {formatTime(message.createdAt) && (
                    <span className="px-1 text-[11px] text-foreground/45">
                      {formatTime(message.createdAt)}
                    </span>
                  )}
                </div>
              )
            )}

            {busy && (
              <div className="flex w-full flex-col items-start gap-1.5">
                <span className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground/70">
                  <Sparkles className="size-3.5" aria-hidden />
                  المعلم الذكي
                </span>
                <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tr-sm border border-border/50 bg-white px-4 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-[#3a2313] motion-reduce:animate-none" />
                  <span className="size-1.5 animate-bounce rounded-full bg-[#3a2313] [animation-delay:120ms] motion-reduce:animate-none" />
                  <span className="size-1.5 animate-bounce rounded-full bg-[#3a2313] [animation-delay:240ms] motion-reduce:animate-none" />
                </div>
              </div>
            )}

            {hasError && !busy && (
              <div className="flex w-full flex-col items-start gap-1.5">
                <span className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground/70">
                  <Sparkles className="size-3.5" aria-hidden />
                  المعلم الذكي
                </span>
                <div className="w-fit max-w-[85%] rounded-2xl rounded-tr-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p className="whitespace-pre-line">{statusText || "حدث خطأ في المعلم الذكي."}</p>
                  <Button size="sm" variant="ghost" className="mt-2 h-8 px-2 text-destructive" onClick={handleNewChat}>
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* شريط الإدخال العائم */}
      <footer className="border-t border-border/50 bg-white/70 px-6 py-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-white p-2 shadow-lg shadow-black/5 focus-within:border-[#3a2313]/40">
            <Button
              onClick={() => handleSend(draft)}
              disabled={!connected || !draft.trim() || busy}
              className="h-11 w-11 shrink-0 rounded-xl"
              size="icon"
              aria-label="إرسال السؤال"
            >
              <Send className="size-[18px] rtl:-scale-x-100" />
            </Button>

            <Textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(draft);
                }
              }}
              placeholder={connected ? "اكتب سؤالك هنا..." : "المعلم الذكي غير متاح الآن..."}
              rows={1}
              className="min-h-11 max-h-40 flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-sm shadow-none focus-visible:ring-0"
              disabled={!connected}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl text-foreground/60"
              title="إرفاق"
              aria-label="إرفاق"
              disabled={!connected}
            >
              <Plus className="size-5" />
            </Button>
          </div>

          <p className="text-center text-[11px] text-foreground/60">
            قد يرتكب المعلم الذكي أخطاء — تحقّق من المعلومات المهمة.
          </p>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}

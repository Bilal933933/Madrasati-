"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogOut, MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import type { AiChatStatus } from "../types/ai-chat.types";
import type { AiThreadSummary } from "../types/ai-chat.types";
import { useAiThreads, useCreateAiThread, useDeleteAiThread } from "../hooks/useAiThreads";

const STATUS_DOT: Record<string, string> = {
  connecting: "bg-muted-foreground/50",
  connected: "bg-emerald-500",
  busy: "bg-amber-500",
  error: "bg-destructive",
  offline: "bg-destructive",
  signedOut: "bg-muted-foreground/50",
};

const STATUS_LABEL: Record<string, string> = {
  connected: "متصل",
  connecting: "جارٍ الاتصال...",
  busy: "يكتب...",
  error: "خطأ",
  offline: "غير متصل",
  signedOut: "تم تسجيل الخروج",
};

type HistorySidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  status: AiChatStatus;
  onLogout: () => void;
};

/**
 * درج جانبي لجلسات المعلم الذكي — مقسم حسب التاريخ (اليوم/أمس/الأسبوع/الأقدم).
 * يحمل كل عناصر التحكم (محادثة جديدة، الحالة، الخروج) بأسلوب Gemini بدون هيدر علوي.
 * يُحدّث تلقائيًا عبر TanStack Query ويعيد توجيه الطالب عند بدء جلسة جديدة.
 */
export function HistorySidebar({ isOpen, onToggle, status, onLogout }: HistorySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: threads, isLoading } = useAiThreads();
  const createThread = useCreateAiThread();
  const deleteThread = useDeleteAiThread();
  const [deletingThread, setDeletingThread] = useState<AiThreadSummary | null>(null);

  const activeId = pathname.split("/").pop() ?? null;

  const groups = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfYesterday = startOfToday - 86_400_000;
    const startOfWeek = startOfToday - 6 * 86_400_000;

    const buckets: { label: string; items: NonNullable<typeof threads> }[] = [
      { label: "اليوم", items: [] },
      { label: "أمس", items: [] },
      { label: "الأسبوع الماضي", items: [] },
      { label: "الأقدم", items: [] },
    ];

    for (const thread of threads ?? []) {
      const time = thread.updatedAt ? new Date(thread.updatedAt).getTime() : 0;
      if (time >= startOfToday) buckets[0].items.push(thread);
      else if (time >= startOfYesterday) buckets[1].items.push(thread);
      else if (time >= startOfWeek) buckets[2].items.push(thread);
      else buckets[3].items.push(thread);
    }

    return buckets.filter((b) => b.items.length > 0);
  }, [threads]);

  async function handleNewChat(): Promise<void> {
    try {
      const thread = await createThread.mutateAsync();
      router.push(`/ai-tutor/${thread.id}`);
    } catch {
      // الخطأ يُعرض عبر Toaster في useResourceMutation — هنا نكتفي بالصمت
    }
  }

  if (!isOpen) return null;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border/50 bg-white/60">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-[#2b1a0e]">المحادثات</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 px-2 text-foreground/70"
          title="إخفاء القائمة"
          aria-label="إخفاء قائمة المحادثات"
        >
          <MessageSquare className="size-4" />
        </Button>
      </div>

      <div className="px-3 pb-2">
        <Button
          type="button"
          onClick={() => void handleNewChat()}
          disabled={createThread.isPending}
          className="w-full gap-2 rounded-xl"
        >
          {createThread.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          محادثة جديدة
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : groups.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-foreground/70">
            لا توجد محادثات سابقة بعد.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 pb-1 text-[11px] font-semibold text-foreground/70">
                {group.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((thread) => (
                  <li key={thread.id} className="group relative">
                    <Link
                      href={`/ai-tutor/${thread.id}`}
                      className={cn(
                        "block rounded-lg px-2.5 py-2 text-sm transition-colors",
                        thread.id === activeId
                          ? "bg-[#3a2313] text-[#f5e9d8]"
                          : "text-foreground/85 hover:bg-[#f5e9d8]/60"
                      )}
                    >
                      <span className="block truncate font-medium">{thread.title}</span>
                      <span className="block truncate text-[11px] opacity-70">
                        {thread.lastMessage ?? "بدون رسائل"}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeletingThread(thread)}
                      className="absolute left-1.5 top-1/2 hidden -translate-y-1/2 rounded-md p-1 text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:block disabled:pointer-events-none disabled:opacity-50"
                      title="حذف المحادثة"
                      aria-label={`حذف ${thread.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* تذييل الشريط الجانبي: الحالة + العودة + الخروج (بأسلوب Gemini) */}
      <div className="shrink-0 border-t border-border/50 p-3">
        <div className="mb-1 flex items-center gap-2 px-1.5 py-1 text-xs text-foreground/70">
          <span
            className={cn("size-2 rounded-full", STATUS_DOT[status] ?? STATUS_DOT.connected)}
            aria-hidden
          />
          {STATUS_LABEL[status] ?? "متصل"}
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-foreground/70"
          title="العودة إلى المنصة"
        >
          <Link href="/home">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            العودة إلى المنصة
          </Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start gap-2 text-foreground/70"
          title="تسجيل الخروج من المعلم الذكي"
        >
          <LogOut className="size-4 rtl:rotate-180" aria-hidden />
          خروج
        </Button>
      </div>

      <DeleteDialog
        open={deletingThread !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingThread(null);
        }}
        title="حذف المحادثة"
        description={`هل أنت متأكد من حذف محادثة "${deletingThread?.title}"؟ سيتم حذف جميع الرسائل الموجودة فيها نهائيًا.`}
        isPending={deleteThread.isPending}
        onConfirm={() => {
          if (deletingThread) {
            deleteThread.mutate(deletingThread.id, {
              onSuccess: () => setDeletingThread(null),
            });
          }
        }}
      />
    </aside>
  );
}

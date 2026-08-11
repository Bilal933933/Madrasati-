"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAiTutorChat } from "../hooks/useAiTutorChat";
import { AiTutorChat } from "./ai-tutor-chat";
import { HistorySidebar } from "./history-sidebar";

/**
 * مساحة عمل المعلم الذكي: شريط جانبي قابل للطي للمحادثات + الدردشة.
 * لا يوجد أي هيدر علوي — كل التحكم داخل الشريط الجانبي (بأسلوب Gemini).
 * يعمل مع threadId موجود (صفحة /ai-tutor/[threadId]).
 */
export function AiTutorWorkspace({ threadId }: { threadId?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chat = useAiTutorChat(threadId);

  return (
    <div className="relative flex h-full min-h-0 w-full">
      <HistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        status={chat.status}
        onLogout={chat.logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AiTutorChat chat={chat} />
      </div>

      {!sidebarOpen && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "absolute top-3 start-3 z-10 size-9 rounded-xl border border-border/60 bg-white/90 text-foreground/70 shadow-sm backdrop-blur",
            "rtl:-scale-x-100"
          )}
          title="إظهار المحادثات"
          aria-label="إظهار المحادثات"
        >
          <PanelLeft className="size-4" />
        </Button>
      )}
    </div>
  );
}

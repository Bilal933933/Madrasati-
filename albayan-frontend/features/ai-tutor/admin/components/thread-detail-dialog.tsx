"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAiAdminThreadDetail } from "../hooks/useAiAdmin";
import type { AiAdminMessage } from "../types/ai-admin.types";

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message }: { message: AiAdminMessage }) {
  const isUser = message.sender === "USER";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground"
        }`}
      >
        {message.kind === "quiz" ? (
          <span className="font-medium">[سؤال اختبار]</span>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <span
          className={`mt-1 block text-[10px] ${
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

export function AiThreadDetailDialog({
  threadId,
  onOpenChange,
}: {
  threadId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useAiAdminThreadDetail(threadId);

  return (
    <Dialog open={threadId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{data?.title ?? "المحادثة"}</DialogTitle>
          <DialogDescription>
            {data
              ? `الطالب: ${data.student.name} (${data.student.email}) — ${data.messages.length} رسالة`
              : "قراءة محادثة طالب مع المعلم الآلي."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {isLoading && !data ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : data && data.messages.length > 0 ? (
            data.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              لا توجد رسائل في هذه المحادثة.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
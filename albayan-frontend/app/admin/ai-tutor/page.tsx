"use client";

import { useEffect, useState } from "react";
import { Eye, MessageSquareText, Users, MessagesSquare, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  useAiAdminStats,
  useAiAdminThreads,
} from "@/features/ai-tutor/admin/hooks/useAiAdmin";
import { AiThreadDetailDialog } from "@/features/ai-tutor/admin/components/thread-detail-dialog";
import type { AiAdminThreadListItem } from "@/features/ai-tutor/admin/types/ai-admin.types";

const PAGE_SIZE = 20;

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number | null;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">
          {value === null ? (
            <Skeleton className="h-7 w-14" />
          ) : (
            value.toLocaleString("ar-EG")
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminAiTutorPage() {
  const stats = useAiAdminStats();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const list = useAiAdminThreads({ page, perPage: PAGE_SIZE, search: search || undefined });

  const threads = list.data?.data ?? [];
  const meta = list.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="المعلم الآلي"
        description="مراجعة محادثات الطلاب مع المعلم الآلي — قراءة فقط."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={MessagesSquare}
          label="المحادثات"
          value={stats.data?.totalThreads ?? null}
        />
        <StatCard
          icon={MessageSquareText}
          label="الرسائل"
          value={stats.data?.totalMessages ?? null}
        />
        <StatCard
          icon={Users}
          label="الطلاب النشطون"
          value={stats.data?.activeStudents ?? null}
        />
      </div>

      <div className="mt-4">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="بحث باسم الطالب أو بريده…"
            aria-label="بحث في محادثات المعلم الآلي"
            className="h-8 ps-9"
          />
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0 pt-4">
          {list.isLoading ? (
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : threads.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessagesSquare />
                </EmptyMedia>
                <EmptyTitle>لا توجد محادثات</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>
                  لم يبدأ الطلاب محادثات مع المعلم الآلي بعد.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-52">الطالب</TableHead>
                  <TableHead className="min-w-40">المحادثة</TableHead>
                  <TableHead className="hidden text-center sm:table-cell">الرسائل</TableHead>
                  <TableHead className="hidden md:table-cell">آخر نشاط</TableHead>
                  <TableHead className="pe-2 text-end">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.map((thread: AiAdminThreadListItem) => (
                  <TableRow key={thread.id}>
                    <TableCell className="min-w-52">
                      <div className="flex min-w-0 flex-col">
                        <span className="min-w-0 truncate font-medium">
                          {thread.student.name}
                        </span>
                        <span className="min-w-0 truncate text-xs text-muted-foreground">
                          {thread.student.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-40">
                      <span className="line-clamp-1 text-sm">
                        {thread.title ?? "محادثة بدون عنوان"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-center sm:table-cell">
                      {thread.messageCount}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(thread.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailId(thread.id)}
                        >
                          <Eye />
                          عرض
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <AiThreadDetailDialog threadId={detailId} onOpenChange={(open) => {
        if (!open) setDetailId(null);
      }} />
    </div>
  );
}
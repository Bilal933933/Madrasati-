"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FileCheck2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_LINKS, type DashboardLink } from "../dashboard-links";
import type { AnalyticsCounts } from "@/features/analytics/types/analytics.types";

function formatNumber(value: number): string {
  return value.toLocaleString("ar-EG");
}

function LinkCard({ item }: { item: DashboardLink }) {
  return (
    <Link href={item.href} className="group h-full">
      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
        <CardHeader>
          <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <item.icon className="size-5" />
          </span>
          <CardTitle className="text-base">{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function StatusLine({ tone, children }: { tone: "ok" | "warn"; children: ReactNode }) {
  return (
    <p
      className={
        tone === "ok"
          ? "text-xs text-emerald-700 dark:text-emerald-400"
          : "text-xs text-amber-700 dark:text-amber-400"
      }
    >
      {children}
    </p>
  );
}

/**
 * بطاقة الدروس الإجرائية: الإجمالي + حالة النشر + زر الإدارة.
 */
function LessonsCard({ counts }: { counts: AnalyticsCounts }) {
  const drafts = counts.lessons_unpublished;
  return (
    <Card className="flex h-full flex-col border-primary/30">
      <CardHeader className="flex-1">
        <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="size-5" />
        </span>
        <CardTitle className="text-base">
          الدروس{" "}
          <span className="ms-1 text-2xl font-semibold tabular-nums">
            {formatNumber(counts.lessons)}
          </span>
        </CardTitle>
        <CardDescription>إدارة الدروس وتنظيمها ضمن المقررات.</CardDescription>
        {drafts > 0 ? (
          <StatusLine tone="warn">
            {formatNumber(drafts)} مسودة تحتاج نشرًا
          </StatusLine>
        ) : (
          <StatusLine tone="ok">كل الدروس منشورة</StatusLine>
        )}
      </CardHeader>
      <div className="px-6 pb-6">
        <Button asChild className="w-full" variant="secondary">
          <Link href="/admin/lessons">إدارة الدروس</Link>
        </Button>
      </div>
    </Card>
  );
}

/**
 * بطاقة الامتحانات الإجرائية: التعريفات النشطة + المحاولات + زر الإدارة.
 */
function ExamsCard({ counts }: { counts: AnalyticsCounts }) {
  return (
    <Card className="flex h-full flex-col border-primary/30">
      <CardHeader className="flex-1">
        <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileCheck2 className="size-5" />
        </span>
        <CardTitle className="text-base">
          الامتحانات{" "}
          <span className="ms-1 text-2xl font-semibold tabular-nums">
            {formatNumber(counts.active_blueprints)}
          </span>
        </CardTitle>
        <CardDescription>إدارة تعريفات الامتحانات ونطاقاتها.</CardDescription>
        <StatusLine tone="ok">
          {formatNumber(counts.active_blueprints)} تعريف نشط ·{" "}
          {formatNumber(counts.exam_attempts)} محاولة مكتملة
        </StatusLine>
      </CardHeader>
      <div className="px-6 pb-6">
        <Button asChild className="w-full" variant="secondary">
          <Link href="/admin/exams">إدارة الامتحانات</Link>
        </Button>
      </div>
    </Card>
  );
}

/**
 * شبكة بطاقات اللوحة: الدروس والامتحانات إجرائية (حالة + زر)، والبقية روابط.
 */
export function DashboardCards({
  counts,
  isLoading,
}: {
  counts: AnalyticsCounts | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !counts) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-[172px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DASHBOARD_LINKS.map((item) => {
        if (item.href === "/admin/lessons") {
          return <LessonsCard key={item.href} counts={counts} />;
        }
        if (item.href === "/admin/exams") {
          return <ExamsCard key={item.href} counts={counts} />;
        }
        return <LinkCard key={item.href} item={item} />;
      })}
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DashboardCards } from "@/features/admin/components/dashboard-cards";
import { DashboardStats } from "@/features/admin/components/dashboard-stats";
import { useAnalyticsSummary } from "@/features/analytics/hooks/useAnalytics";

export default function AdminDashboardPage() {
  const { data, isPending } = useAnalyticsSummary();

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="لوحة التحكم"
        description="أهلاً بك في لوحة إدارة مدرستي — اختر قسمًا للإدارة."
      />

      <DashboardStats />

      <DashboardCards counts={data?.data.counts} isLoading={isPending} />
    </div>
  );
}

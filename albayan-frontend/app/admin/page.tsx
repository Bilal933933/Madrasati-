"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_LINKS } from "@/features/admin/dashboard-links";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          أهلاً بك في لوحة إدارة مدرستي — اختر قسمًا للإدارة.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="transition-colors hover:border-primary/50 hover:bg-accent/40">
              <CardHeader>
                <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
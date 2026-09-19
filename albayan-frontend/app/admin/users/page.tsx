"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersTable } from "@/features/users/components/users-table";
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/features/users/hooks/useAdminUsers";
import {
  USER_ROLE_LABELS,
  USER_ROLES,
  type AdminUser,
  type ManagedUserRole,
} from "@/features/users/types/user.types";
import { useAuthStore } from "@/features/auth/store/authStore";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");

  // تأخير البحث حتى يتوقف المستخدم عن الكتابة (لا طلب لكل حرف)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: role !== "all" ? (role as ManagedUserRole) : undefined,
    page,
    perPage: PAGE_SIZE,
  });

  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();

  const users = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;

  function handleRoleChange(user: AdminUser, nextRole: ManagedUserRole) {
    if (nextRole === user.role) return;
    updateRole.mutate({ id: user.id, payload: { role: nextRole } });
  }

  function handleToggleStatus(user: AdminUser) {
    updateStatus.mutate({
      id: user.id,
      payload: { is_active: !user.is_active },
    });
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="المستخدمون"
        description="إدارة الطلاب والمعلمين والمشرفين — الأدوار وتفعيل الحسابات."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني…"
            aria-label="بحث بالمستخدمين"
            className="h-8 ps-9"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="تصفية حسب الدور" className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأدوار</SelectItem>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {USER_ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 pt-4">
          <UsersTable
            users={users}
            isLoading={isLoading}
            isCurrentUser={(userId) => userId === currentUser?.id}
            onRoleChange={handleRoleChange}
            onToggleStatus={handleToggleStatus}
            rolePending={updateRole.isPending}
            statusPending={updateStatus.isPending}
          />
        </CardContent>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}
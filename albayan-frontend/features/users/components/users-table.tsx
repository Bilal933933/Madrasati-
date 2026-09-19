"use client";

import { UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  USER_ROLE_LABELS,
  USER_ROLES,
  type AdminUser,
  type ManagedUserRole,
} from "@/features/users/types/user.types";

type UsersTableProps = {
  users: AdminUser[];
  isLoading: boolean;
  isCurrentUser: (userId: number) => boolean;
  onRoleChange: (user: AdminUser, role: ManagedUserRole) => void;
  onToggleStatus: (user: AdminUser) => void;
  rolePending: boolean;
  statusPending: boolean;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function UsersTable({
  users,
  isLoading,
  isCurrentUser,
  onRoleChange,
  onToggleStatus,
  rolePending,
  statusPending,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserCheck />
          </EmptyMedia>
          <EmptyTitle>لا يوجد مستخدمون</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>جرّب تغيير الفلتر أو كلمة البحث.</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-56">المستخدم</TableHead>
          <TableHead className="hidden sm:table-cell">الدور</TableHead>
          <TableHead className="hidden md:table-cell">تاريخ التسجيل</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="min-w-56">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {user.name.trim().charAt(0)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="min-w-0 truncate font-medium">{user.name}</span>
                  <span className="min-w-0 truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Select
                value={user.role}
                onValueChange={(role) => onRoleChange(user, role as ManagedUserRole)}
                disabled={rolePending || isCurrentUser(user.id)}
              >
                <SelectTrigger
                  aria-label={`تعديل دور ${user.name}`}
                  className="w-32"
                  disabled={rolePending || isCurrentUser(user.id)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {formatDate(user.created_at)}
            </TableCell>
            <TableCell>
              <span
                data-slot="badge"
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.is_active
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {user.is_active ? "مفعّل" : "موقوف"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={statusPending || isCurrentUser(user.id)}
                  onClick={() => onToggleStatus(user)}
                  className={user.is_active ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}
                >
                  {user.is_active ? <UserX /> : <UserCheck />}
                  {user.is_active ? "إيقاف" : "تفعيل"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
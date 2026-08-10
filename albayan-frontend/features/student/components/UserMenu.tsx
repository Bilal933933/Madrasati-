"use client";

import { BarChart3, History, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";

/**
 * قائمة المستخدم (Menu) في رأس بيت الطالب:
 * صورة/حرف الاسم + قائمة منسدلة فيها لوحة التحكم (للمدير) وتسجيل الخروج.
 */
export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  const initial = user.name.trim().charAt(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="قائمة المستخدم"
          className="flex cursor-pointer items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar size="sm">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {user.role === "admin" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <LayoutDashboard className="size-4" />
                لوحة التحكم
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/results" className="cursor-pointer">
                <BarChart3 className="size-4" />
                نتائجي
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/exams/attempts" className="cursor-pointer">
                <History className="size-4" />
                محاولاتي
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="size-4 rtl:rotate-180" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

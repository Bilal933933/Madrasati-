"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";

/**
 * دروب داون المستخدم: يعرض الصورة والاسم والبريد،
 * مع زر تسجيل الخروج (يستدعي /api/logout ثم ينتقل لصفحة الدخول).
 */
export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push("/login"),
    });
  }

  if (!user) {
    return (
      <Button asChild variant="outline" className="h-9">
        <Link href="/login">تسجيل الدخول</Link>
      </Button>
    );
  }

  const initial = user.name?.trim().charAt(0) || "م";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="قائمة المستخدم"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar>
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onSelect={() => handleLogout()}
        >
          {isPending ? <Spinner /> : <LogOut />}
          {isPending ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

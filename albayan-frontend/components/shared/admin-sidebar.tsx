"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  CalendarDays,
  Library,
  BookMarked,
  FileText,
  GraduationCap,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/shared/user-menu";

const NAV_ITEMS = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/stages", label: "المراحل الدراسية", icon: Layers },
  { href: "/admin/grades", label: "الصفوف الدراسية", icon: BookOpen },
  { href: "/admin/semesters", label: "الفصول الدراسية", icon: CalendarDays },
  { href: "/admin/subjects", label: "المواد الدراسية", icon: Library },
  { href: "/admin/courses", label: "الوحدات", icon: BookMarked },
  { href: "/admin/lessons", label: "الدروس", icon: FileText },
  { href: "/admin/bank-questions", label: "بنك الأسئلة", icon: HelpCircle },
  { href: "/admin/exams", label: "الامتحانات", icon: FileCheck2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[active=true]:bg-transparent data-[active=true]:text-sidebar-accent-foreground"
            >
              <Link href="/admin">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <span className="font-semibold group-data-[collapsible=icon]:hidden">
                  مدرستي — الإدارة
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>الإدارة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center gap-2 p-1">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
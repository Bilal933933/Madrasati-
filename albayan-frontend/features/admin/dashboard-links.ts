import {
  Layers,
  BookOpen,
  Library,
  GraduationCap,
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface DashboardLink {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const DASHBOARD_LINKS: DashboardLink[] = [
  { href: "/admin/stages", title: "المراحل الدراسية", description: "إدارة مراحل التعليم في المنصة.", icon: Layers },
  { href: "/admin/grades", title: "الصفوف الدراسية", description: "إدارة الصفوف وتنظيمها ضمن المراحل.", icon: BookOpen },
  { href: "/admin/subjects", title: "المواد الدراسية", description: "إدارة المواد وتنظيمها ضمن الصفوف.", icon: Library },
  { href: "/admin/courses", title: "المقررات الدراسية", description: "إدارة المقررات وتنظيمها ضمن المواد.", icon: GraduationCap },
  { href: "/admin/lessons", title: "الدروس", description: "إدارة الدروس وتنظيمها ضمن المقررات.", icon: FileText },
];
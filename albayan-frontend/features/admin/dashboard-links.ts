import {
  Layers,
  BookOpen,
  Library,
  CalendarDays,
  GraduationCap,
  FileText,
  HelpCircle,
  FileCheck2,
  Medal,
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
  { href: "/admin/semesters", title: "الفصول الدراسية", description: "إدارة الفصول وتنظيمها ضمن الصفوف.", icon: CalendarDays },
  { href: "/admin/subjects", title: "المواد الدراسية", description: "إدارة المواد وتنظيمها ضمن الصفوف.", icon: Library },
  { href: "/admin/courses", title: "المقررات الدراسية", description: "إدارة المقررات وتنظيمها ضمن المواد.", icon: GraduationCap },
  { href: "/admin/lessons", title: "الدروس", description: "إدارة الدروس وتنظيمها ضمن المقررات.", icon: FileText },
  { href: "/admin/bank-questions", title: "بنك الأسئلة", description: "إدارة أسئلة الامتحانات المرتبطة بالدروس.", icon: HelpCircle },
  { href: "/admin/exams", title: "الامتحانات", description: "إدارة تعريفات الامتحانات ونطاقاتها.", icon: FileCheck2 },
  { href: "/admin/achievements", title: "الإنجازات", description: "إدارة أوسمة الإنجاز وعتبات فتحها.", icon: Medal },
];
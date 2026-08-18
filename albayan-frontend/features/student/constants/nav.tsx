import {
  BarChart3,
  Compass,
  GraduationCap,
  Home as HomeIcon,
  LayoutDashboard,
  LogOut,
  Medal,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { NavItem } from "@/components/shared/site-navbar";

/** روابط الهيدر الموحّدة لمناطق الطالب (الرئيسية · الامتحانات · نتائجي · الإنجازات). */
export const STUDENT_LINKS: NavItem[] = [
  { href: "/home", label: "الرئيسية" },
  { href: "/exams", label: "الامتحانات" },
  { href: "/results", label: "نتائجي" },
  { href: "/achievements", label: "الإنجازات" },
];

export type StudentDockItem = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

type StudentDockOptions = {
  /** إضافة زر تسجيل الخروج (يُستخدم في المناطق التي لا يوجد فيها فوتر/قائمة مستخدم دائمة). */
  onLogout?: () => void;
  /** إضافة لوحة التحكم للمدير. */
  isAdmin?: boolean;
  /** إضافة المعلم الذكي (بيت الطالب). */
  withAiTutor?: boolean;
};

/**
 * عناصر الشريط السفلي (StudentDock) من مصدر واحد لكل مناطق الطالب.
 * يضيف كل layout خياراته الإضافية عبر options مع الحفاظ على الترتيب الحالي.
 */
export function studentDockItems(
  router: ReturnType<typeof useRouter>,
  options: StudentDockOptions = {}
): StudentDockItem[] {
  const items: StudentDockItem[] = [
    { icon: <HomeIcon size={16} />, label: "الرئيسية", onClick: () => router.push("/home") },
    { icon: <Compass size={16} />, label: "المواد", onClick: () => router.push("/home") },
    { icon: <GraduationCap size={16} />, label: "الامتحانات", onClick: () => router.push("/exams") },
    { icon: <Medal size={16} />, label: "الإنجازات", onClick: () => router.push("/achievements") },
  ];

  if (options.withAiTutor) {
    items.push({
      icon: <Sparkles size={16} />,
      label: "المعلم الذكي",
      onClick: () => router.push("/ai-tutor"),
    });
  }

  items.push({ icon: <BarChart3 size={16} />, label: "نتائجي", onClick: () => router.push("/results") });

  if (options.isAdmin) {
    items.push({
      icon: <LayoutDashboard size={16} />,
      label: "لوحة التحكم",
      onClick: () => router.push("/admin"),
    });
  }

  if (options.onLogout) {
    items.push({ icon: <LogOut size={16} />, label: "تسجيل الخروج", onClick: options.onLogout });
  }

  return items;
}

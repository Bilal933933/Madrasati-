import { PageSkeleton } from "@/components/shared/page-skeleton";

/**
 * شاشة تحميل عامة — تظهر أثناء تحميل الصفحات (الانتقال بين المسارات).
 * تُزاح قليلاً إلى الأسفل لأن الـ Loader ثابت (fixed) وسطي.
 */
export default function LoadingPage() {
  return <PageSkeleton />;
}

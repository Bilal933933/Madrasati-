import { Loader } from "@/components/shared/loader";

/**
 * شاشة تحميل عامة — تظهر أثناء تحميل الصفحات (الانتقال بين المسارات).
 * تُزاح قليلاً إلى الأسفل لأن الـ Loader ثابت (fixed) وسطي.
 */
export default function LoadingPage() {
  return <Loader className="translate-y-12" />;
}
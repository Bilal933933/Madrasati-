import Link from "next/link";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="نسيت كلمة السر؟"
      description="أدخل بريدك الإلكتروني وسنرسل لك رابط الاسترجاع"
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          العودة لتسجيل الدخول
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

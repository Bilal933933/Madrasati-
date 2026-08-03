import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="إعادة تعيين كلمة السر"
      description="أدخل كلمة السر الجديدة"
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          العودة لتسجيل الدخول
        </Link>
      }
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}

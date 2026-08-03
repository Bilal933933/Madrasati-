import Link from "next/link";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="إنشاء حساب جديد"
      description="ابدأ رحلتك التعليمية مع مدرستي"
      footer={
        <span>
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            سجّل الدخول
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

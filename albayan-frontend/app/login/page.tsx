import Link from "next/link";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="تسجيل الدخول"
      description="أهلًا بعودتك! سجّل دخولك للمتابعة"
      footer={
        <span>
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            أنشئ حسابًا
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

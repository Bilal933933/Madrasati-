import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">تسجيل الدخول</h1>
      <LoginForm />
    </main>
  );
}

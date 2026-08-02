import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">إنشاء حساب جديد</h1>
      <RegisterForm />
    </main>
  );
}

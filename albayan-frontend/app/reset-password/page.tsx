import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">
        إعادة تعيين كلمة السر
      </h1>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

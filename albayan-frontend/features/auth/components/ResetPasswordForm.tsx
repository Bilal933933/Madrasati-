"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "../hooks/usePasswordReset";

/**
 * يُستخدم في صفحة يفتحها المستخدم من رابط البريد الإلكتروني
 * مثال: /reset-password?token=xxx&email=user@example.com
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { mutate, isPending, error } = useResetPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate(
      {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => router.push("/login"),
      }
    );
  }

  const errorMessage = (error as { message?: string })?.message;

  if (!token || !email) {
    return (
      <p className="text-sm text-destructive" dir="rtl">
        رابط إعادة التعيين غير صالح أو منتهي الصلاحية.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">كلمة السر الجديدة</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password_confirmation">تأكيد كلمة السر</Label>
        <Input
          id="password_confirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "جارٍ الحفظ..." : "تغيير كلمة السر"}
      </Button>
    </form>
  );
}

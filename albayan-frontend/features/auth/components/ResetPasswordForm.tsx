"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useResetPassword } from "../hooks/usePasswordReset";
import { PasswordInput } from "./PasswordInput";

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
      <p
        className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        dir="rtl"
      >
        رابط إعادة التعيين غير صالح أو منتهي الصلاحية.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
      <Field>
        <FieldLabel htmlFor="password">كلمة السر الجديدة</FieldLabel>
        <FieldContent>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
          <FieldError errors={[{ message: errorMessage }]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password_confirmation">تأكيد كلمة السر</FieldLabel>
        <FieldContent>
          <PasswordInput
            id="password_confirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
          <FieldError errors={[{ message: errorMessage }]} />
        </FieldContent>
      </Field>

      <Button type="submit" disabled={isPending} className="h-11 w-full text-base">
        {isPending && <Spinner />}
        {isPending ? "جارٍ الحفظ..." : "تغيير كلمة السر"}
      </Button>
    </form>
  );
}

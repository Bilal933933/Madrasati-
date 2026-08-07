"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib/apiErrors";
import { useLogin } from "../hooks/useLogin";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login({ email, password });
  }

  const errorMessage = getErrorMessage(error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
      <Field className="gap-1.5">
        <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Mail className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="example@email.com"
              className="h-12 rounded-full bg-card pe-10 ps-4 shadow-[0_8px_16px_-8px_rgba(176,139,102,0.35)] transition-all focus-visible:shadow-[0_10px_20px_-10px_rgba(176,139,102,0.5)]"
            />
          </div>
        </FieldContent>
      </Field>

      <Field className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <FieldContent>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-12 rounded-full text-sm shadow-[0_8px_16px_-8px_rgba(176,139,102,0.35)] transition-all focus-visible:shadow-[0_10px_20px_-10px_rgba(176,139,102,0.5)]"
          />
          <FieldError errors={[{ message: errorMessage }]} />
        </FieldContent>
      </Field>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-12 w-full rounded-full bg-gradient-to-l from-primary to-[color-mix(in_srgb,var(--primary),var(--accent-hover)_35%)] text-base text-primary-foreground shadow-[0_14px_22px_-14px_rgba(176,139,102,0.9)] transition-all hover:scale-[1.02] hover:shadow-[0_18px_26px_-16px_rgba(176,139,102,0.9)] active:scale-[0.98]"
      >
        {isPending && <Spinner />}
        {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>

      <div className="relative mt-1 flex items-center">
        <div className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs text-muted-foreground">أو</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleLoginButton />
    </form>
  );
}
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
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

  const errorMessage = (error as { message?: string })?.message;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
      <Field>
        <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 ps-9"
            />
          </div>
        </FieldContent>
      </Field>

      <Field>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="password">كلمة السر</FieldLabel>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            نسيت كلمة السر؟
          </Link>
        </div>
        <FieldContent>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11"
          />
          <FieldError errors={[{ message: errorMessage }]} />
        </FieldContent>
      </Field>

      <Button type="submit" disabled={isPending} className="h-11 w-full text-base">
        {isPending && <Spinner />}
        {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>

      <FieldSeparator>أو</FieldSeparator>

      <GoogleLoginButton />
    </form>
  );
}

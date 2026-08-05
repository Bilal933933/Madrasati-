"use client";

import { useState, type FormEvent } from "react";
import { Mail, User } from "lucide-react";
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
import { useRegister } from "../hooks/useRegister";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const { mutate: register, isPending, error } = useRegister();

  const [confirmError, setConfirmError] = useState<string>();

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "password_confirmation") {
      setConfirmError(value !== form.password ? "كلمتا السر غير متطابقتين." : undefined);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setConfirmError("كلمتا السر غير متطابقتين.");
      return;
    }
    register(form);
  }

  const errorMessage = (error as { message?: string })?.message;
  const fieldErrors = (error as { errors?: Record<string, string[]> })?.errors;

  function fieldError(field: string) {
    return { message: fieldErrors?.[field]?.[0] };
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
      <Field>
        <FieldLabel htmlFor="name">الاسم</FieldLabel>
        <FieldContent>
          <div className="relative">
            <User className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="h-11 pe-9"
            />
          </div>
          <FieldError errors={[fieldError("name")]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Mail className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              autoComplete="email"
              className="h-11 pe-9"
            />
          </div>
          <FieldError errors={[fieldError("email")]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">كلمة السر</FieldLabel>
        <FieldContent>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
          <FieldError errors={[fieldError("password")]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password_confirmation">تأكيد كلمة السر</FieldLabel>
        <FieldContent>
          <PasswordInput
            id="password_confirmation"
            value={form.password_confirmation}
            onChange={(e) => handleChange("password_confirmation", e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
          <FieldError errors={confirmError ? [{ message: confirmError }] : []} />
        </FieldContent>
      </Field>

      {errorMessage && !fieldErrors && <FieldError errors={[{ message: errorMessage }]} />}

      <Button type="submit" disabled={isPending} className="h-11 w-full text-base">
        {isPending && <Spinner />}
        {isPending ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
      </Button>

      <FieldSeparator>أو</FieldSeparator>

      <GoogleLoginButton />
    </form>
  );
}

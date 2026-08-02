"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "../hooks/useRegister";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const { mutate: register, isPending, error } = useRegister();

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register(form);
  }

  const errorMessage = (error as { message?: string })?.message;
  const fieldErrors = (error as { errors?: Record<string, string[]> })
    ?.errors;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
        {fieldErrors?.name && (
          <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          autoComplete="email"
        />
        {fieldErrors?.email && (
          <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">كلمة السر</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          required
          autoComplete="new-password"
        />
        {fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password_confirmation">تأكيد كلمة السر</Label>
        <Input
          id="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={(e) =>
            handleChange("password_confirmation", e.target.value)
          }
          required
          autoComplete="new-password"
        />
      </div>

      {errorMessage && !fieldErrors && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
      </Button>

      <div className="relative my-2 text-center text-sm text-muted-foreground">
        <span className="bg-background px-2">أو</span>
      </div>

      <GoogleLoginButton />
    </form>
  );
}

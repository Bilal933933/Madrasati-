"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "../hooks/useLogin";
import { GoogleLoginButton } from "./GoogleLoginButton";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">كلمة السر</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>

      <div className="relative my-2 text-center text-sm text-muted-foreground">
        <span className="bg-background px-2">أو</span>
      </div>

      <GoogleLoginButton />
    </form>
  );
}

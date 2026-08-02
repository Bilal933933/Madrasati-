"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "../hooks/usePasswordReset";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, error, data } = useForgotPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate({ email });
  }

  const errorMessage = (error as { message?: string })?.message;

  if (isSuccess) {
    return (
      <p className="text-sm text-muted-foreground" dir="rtl">
        {data?.message}
      </p>
    );
  }

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

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "جارٍ الإرسال..." : "إرسال رابط الاسترجاع"}
      </Button>
    </form>
  );
}

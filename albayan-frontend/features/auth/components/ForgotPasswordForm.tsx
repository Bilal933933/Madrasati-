"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
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
      <div className="flex flex-col items-center gap-3 py-6 text-center" dir="rtl">
        <CircleCheck className="size-10 text-emerald-600" />
        <p className="text-sm text-muted-foreground">{data?.message}</p>
      </div>
    );
  }

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
          <FieldError errors={[{ message: errorMessage }]} />
        </FieldContent>
      </Field>

      <Button type="submit" disabled={isPending} className="h-11 w-full text-base">
        {isPending && <Spinner />}
        {isPending ? "جارٍ الإرسال..." : "إرسال رابط الاسترجاع"}
      </Button>
    </form>
  );
}
